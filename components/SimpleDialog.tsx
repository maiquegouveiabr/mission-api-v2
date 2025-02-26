import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Selector from "@/components/Selector";
import { Area, Referral } from "@/interfaces";
import { SelectChangeEvent } from "@mui/material";
import DisabledByDefaultOutlinedIcon from "@mui/icons-material/DisabledByDefaultOutlined";
import styles from "@/components/styles/SimpleDialog.module.css";

interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  data: Area[];
  referral: Referral;
  postSent: (referral: Referral, offer: string, areaId: number) => void;
}

const WHO_DATA = [
  { id: 1, name: "Pilarzinho R" },
  { id: 2, name: "Pilarzinho H" },
  { id: 3, name: "Elder Gouveia" },
  { id: 4, name: "Elder Bentes" },
  { id: 5, name: "Capão" },
  { id: 6, name: "Boa Vista" },
  { id: 7, name: "Jd. das Américas" },
  { id: 8, name: "Cachoeira 1" },
  { id: 9, name: "Pilarzinho B" },
];

export default function SimpleDialog({ onClose, data, open, referral, postSent }: SimpleDialogProps) {
  const [areaId, setAreaId] = useState(1000);
  const [offer, setOffer] = useState("");
  const [other, setOther] = useState("");
  const [sender, setSender] = useState(0);
  const [referralName, setReferralName] = useState(`${referral.firstName}${referral.lastName ? " " + referral.lastName : ""}`);
  const [sending, setSending] = useState(false);

  const handleSelectorChange = (event: SelectChangeEvent<number>) => {
    setAreaId(Number(event.target.value));
  };
  const handleSelectorChangeWho = (event: SelectChangeEvent<number>) => {
    setSender(Number(event.target.value));
  };

  useEffect(() => {
    if (referral.areaInfo && referral.areaInfo.bestProsAreaId) {
      if (referral.areaInfo.missions && referral.areaInfo.missions[0].id !== 14319) {
        setAreaId(1);
        setOther(referral.areaInfo.missions[0].name);
      } else if (referral.areaInfo.bestProsAreaId === 500625799) setAreaId(0);
      else setAreaId(referral.areaInfo.bestProsAreaId);
    }
  }, [referral.areaInfo]);

  const handleSend = async () => {
    try {
      const name = referralName.trim();
      const offerText = offer.trim();
      const area = areaId;
      const otherText = other.trim();

      if (!name || !offerText || sender === 0 || area === 1000) {
        alert("Bruh, don't forget any fields!");
        return;
      } else {
        if ((area === 1 || area === 0) && !otherText) {
          alert("Bruh, don't forget any fields!");
          return;
        }
      }
      const data = {
        id: referral.personGuid,
        name,
        who_sent: WHO_DATA.find((item) => item.id === sender)?.name,
        other: otherText,
        area_id: area,
        offer: offerText,
        phone: referral.contactInfo?.phoneNumbers[0].number,
      };

      setSending(true);
      const isDev = process.env.NODE_ENV === "development";
      const url = `${isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app"}`;
      const response = await fetch(`${url}/api/db/references`, {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("This referral was sent by someone else!");
        } else {
          throw new Error(response.statusText);
        }
      }
      postSent(referral, offerText.toUpperCase(), area);
      setSending(false);
      handleClose();
    } catch (error) {
      alert(error);
      setSending(false);
      handleClose();
    }
  };

  const handleClose = () => {
    setAreaId(1000);
    setOffer("");
    setOther("");
    setSender(0);
    setSending(false);
    onClose();
  };

  return (
    <Dialog open={open} key={referral.personGuid}>
      <div className={styles.titleContainer}>
        <h2 className={styles.title}>Save Referral</h2>
        <DisabledByDefaultOutlinedIcon onClick={handleClose} cursor="pointer" fontSize="large" color="warning" />
      </div>
      <div className={styles.contentContainer}>
        <TextField
          required
          autoComplete="false"
          id="outlined-basic"
          label="Referral Name"
          variant="outlined"
          value={referralName}
          onChange={(event) => setReferralName(event.target.value)}
        />
        <TextField
          required
          autoComplete="false"
          id="outlined-basic"
          label="Offer"
          variant="outlined"
          value={offer}
          onChange={(event) => setOffer(event.target.value)}
        />
        <Selector onChange={handleSelectorChangeWho} currentValue={sender} inputLabel="Who" data={WHO_DATA} />
        <Selector onChange={handleSelectorChange} currentValue={areaId} inputLabel="Area" data={data} />
        {(areaId === 0 || areaId === 1) && (
          <TextField
            required
            autoComplete="false"
            id="outlined-basic"
            label={`${areaId === 0 ? "UBA Area" : "Mission Name"}`}
            variant="outlined"
            value={other}
            onChange={(event) => setOther(event.target.value)}
          />
        )}
        <Button disabled={sending} onClick={handleSend} variant="outlined" style={{ backgroundColor: "#1976d2", color: "white", fontWeight: "bold" }}>
          Send
        </Button>
      </div>
    </Dialog>
  );
}
