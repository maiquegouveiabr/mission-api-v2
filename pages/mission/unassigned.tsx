import {
  AreaInfo,
  ContactAttempt,
  ReferralCompleteNoPerson,
} from "@/interfaces";
import UnassignedList from "@/components/UnassignedList";
import ReferralItem from "@/components/ReferralItem";
import Button from "@mui/material/Button";
import ContentPasteIcon from "@mui/icons-material/ContentPaste";
import Title from "@/components/Title";
import { useState } from "react";
import styles from "./unassigned.module.css";
import ButtonGroup from "@mui/material/ButtonGroup";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import timestampToDate from "@/util/timestampToDate";

interface UnassignedProps {
  areaInfo: AreaInfo;
  contactAttempts: ContactAttempt[];
  person: ReferralCompleteNoPerson;
}

export default function Unassigned({
  unassigned,
}: {
  unassigned: UnassignedProps[];
}) {
  const [filteredUnassigned, setFiltereredUnassigned] = useState(unassigned);
  const [dateState, setDateState] = useState(true);
  const [attemptsState, setAttemptsState] = useState(false);

  const handleSetFilterUBA = () => {
    const filtered = unassigned.filter((ref) => {
      if (
        ref.areaInfo.organizations &&
        ref.areaInfo.organizations[0].id === 31859
      ) {
        return ref;
      }
    });
    setFiltereredUnassigned(filtered);
  };

  const handleSetDate = () => {
    setDateState(!dateState);
    if (dateState) {
      const filtered = unassigned.sort((a, b) => {
        if (a.person.createDate < b.person.createDate) {
          return -1;
        }
        if (a.person.createDate > b.person.createDate) {
          return 1;
        }
        return 0;
      });
      setFiltereredUnassigned(filtered);
    } else {
      const filtered = unassigned.sort((a, b) => {
        if (b.person.createDate < a.person.createDate) {
          return -1;
        }
        if (b.person.createDate > a.person.createDate) {
          return 1;
        }
        return 0;
      });
      setFiltereredUnassigned(filtered);
    }
  };

  const handleSetAttempts = () => {
    setAttemptsState(!attemptsState);
    if (attemptsState) {
      const filtered = unassigned.sort((a, b) => {
        if (a.contactAttempts.length < b.contactAttempts.length) {
          return -1;
        }
        if (a.contactAttempts.length > b.contactAttempts.length) {
          return 1;
        }
        return 0;
      });
      setFiltereredUnassigned(filtered);
    } else {
      const filtered = unassigned.sort((a, b) => {
        if (b.contactAttempts.length < a.contactAttempts.length) {
          return -1;
        }
        if (b.contactAttempts.length > a.contactAttempts.length) {
          return 1;
        }
        return 0;
      });
      setFiltereredUnassigned(filtered);
    }
  };

  const handleClick = async (ref: UnassignedProps) => {
    try {
      const text = `@${
        ref.areaInfo.proselytingAreas
          ? `${ref.areaInfo.proselytingAreas[0].name}`
          : "AREA_PLACEHOLDER"
      }\n${
        ref.areaInfo.proselytingAreas
          ? `*${ref.areaInfo.proselytingAreas[0].name}*`
          : "*AREA_PLACEHOLDER*"
      }\nEnviamos uma referência para vocês pelo Pregar Meu Evangelho!\n${
        ref.person.lastName
          ? `*${ref.person.firstName} ${ref.person.lastName}*`
          : `*${ref.person.firstName}*`
      } - *OFERTA_PLACEHOLDER*\nNúmero: ${
        ref.person.contactInfo.phoneNumbers[0].number
      }\n*Cadastro em: ${timestampToDate(
        new Date(ref.person.createDate).getTime(),
        true
      )}*\nAdicionamos uma tarefa como observação!`;
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(error);
      alert("There was an error copying the text!");
    }
  };

  return (
    <div>
      <div className={styles.titleContainer}>
        <div
          style={{
            width: "80%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Title
            containerStyles={{ color: "#1976d2" }}
            title={`Unassigned Referrals, (${filteredUnassigned.length})`}
          />
        </div>
        <ButtonGroup variant="contained" aria-label="Basic button group">
          <Button onClick={handleSetFilterUBA}>Uba</Button>
          <Button onClick={handleSetAttempts}>
            Attempts
            <SwapVertIcon />
          </Button>
          <Button onClick={handleSetDate}>
            Date
            <SwapVertIcon />
          </Button>
        </ButtonGroup>
      </div>
      <UnassignedList>
        {filteredUnassigned.map((filteredUnassigned) => (
          <div key={filteredUnassigned.person.id}>
            <ReferralItem
              key={filteredUnassigned.person.id}
              areaInfo={filteredUnassigned.areaInfo}
              contactAttempts={filteredUnassigned.contactAttempts}
              referral={filteredUnassigned.person}
            />
            <Button
              onClick={() => handleClick(filteredUnassigned)}
              style={{ marginTop: "10px" }}
              variant="contained"
              endIcon={<ContentPasteIcon />}
            >
              Copy
            </Button>
          </div>
        ))}
      </UnassignedList>
    </div>
  );
}

export async function getServerSideProps() {
  const isDev = process.env.NODE_ENV === "development";
  const url = isDev
    ? "http://localhost:3000/api/referrals/unassigned"
    : "https://mission-api-gamma.vercel.app/api/referrals/unassigned";
  try {
    const response = await fetch(url);
    const unassigned = await response.json();
    return {
      props: { unassigned },
    };
  } catch (error) {
    console.error(error);
    return {
      props: { unassigned: [] },
    };
  }
}
