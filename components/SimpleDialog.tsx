import { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import Selector from "@/components/Selector";
import { Area, Referral, User } from "@/interfaces";
import { SelectChangeEvent } from "@mui/material";
import DisabledByDefaultOutlinedIcon from "@mui/icons-material/DisabledByDefaultOutlined";
import styles from "@/components/styles/SimpleDialog.module.css";

interface SimpleDialogProps {
  open: boolean;
  onClose: () => void;
  data: Area[];
  referral: Referral;
  postSent: (referral: Referral, offer: string, areaId: number) => void;
  who_data: {
    id: number;
    name: string;
  }[];
}

export default function SimpleDialog({ onClose, data, open, referral, postSent, who_data }: SimpleDialogProps) {
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
    const name = referralName.trim();
    const offerText = offer.trim();
    const area = areaId;
    const otherText = other.trim();

    if (!name || !offerText || sender === 0 || area === 1000) {
      alert("Bruh, don't forget any fields!");
      return;
    } else {
      if ((area === 1 || area === 0 || area === 2) && !otherText) {
        alert("Bruh, don't forget any fields!");
        return;
      }
    }
    const data = {
      id: referral.personGuid,
      name,
      who_sent: who_data.find((item) => item.id === sender)?.name,
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
        alert("This referral was sent by someone else!");
        return;
      } else if (response.status === 500) {
        alert("INTERNAL_SERVER_ERROR");
        return;
      }
    }
    postSent(referral, offerText.toUpperCase(), area);
    setSending(false);
    handleClose();
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
        <DisabledByDefaultOutlinedIcon onClick={handleClose} cursor="pointer" fontSize="large" style={{ color: "#e63946" }} />
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
        <Selector onChange={handleSelectorChangeWho} currentValue={sender} inputLabel="Who" data={who_data} />
        <Selector onChange={handleSelectorChange} currentValue={areaId} inputLabel="Area" data={data} />
        {(areaId === 0 || areaId === 1 || areaId === 2) && (
          <TextField
            required
            autoComplete="false"
            id="outlined-basic"
            label={`${(areaId === 0 && "UBA Area") || (areaId === 1 && "Mission Name") || (areaId === 2 && "Reason To Stop Teaching")}`}
            variant="outlined"
            value={other}
            onChange={(event) => setOther(event.target.value)}
          />
        )}
        <Button
          disabled={sending}
          onClick={handleSend}
          variant="outlined"
          style={{ backgroundColor: "#5b6d31", color: "white", fontWeight: "bold", border: "none" }}
        >
          Send
        </Button>
      </div>
    </Dialog>
  );
}
