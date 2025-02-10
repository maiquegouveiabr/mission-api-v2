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
}

export default function SimpleDialog({ onClose, data, open, referral }: SimpleDialogProps) {
  const [areaId, setAreaId] = useState(1000);
  const [offer, setOffer] = useState("");
  const [other, setOther] = useState("");
  const [sender, setSender] = useState("");
  const [referralName, setReferralName] = useState(`${referral.firstName}${referral.lastName ? " " + referral.lastName : ""}`);
  const [sending, setSending] = useState(false);
  const handleSelectorChange = (event: SelectChangeEvent<number>) => {
    setAreaId(Number(event.target.value));
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
    const senderText = sender.trim();
    const area = areaId;
    const otherText = other.trim();

    if (!name || !offerText || !sender || area === 1000) {
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
      who_sent: senderText,
      other: otherText,
      area_id: area,
      offer: offerText,
      phone: referral.phone,
    };

    setSending(true);
    const isDev = process.env.NODE_ENV === "development";
    const url = `${isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app"}`;
    await fetch(`${url}/api/db/references`, {
      method: "POST",
      body: JSON.stringify(data),
    });

    setSending(false);
    handleClose();
  };

  const handleClose = () => {
    setAreaId(1000);
    setOffer("");
    setOther("");
    setSender("");
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
        <TextField
          required
          autoComplete="false"
          id="outlined-basic"
          label="Who Sending"
          variant="outlined"
          value={sender}
          onChange={(event) => setSender(event.target.value)}
        />
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
        <Button
          disabled={sending}
          onClick={handleSend}
          variant="outlined"
          style={{ backgroundColor: "#1976d2", color: "white", fontWeight: "bold" }}
        >
          Send
        </Button>
      </div>
    </Dialog>
  );
}
