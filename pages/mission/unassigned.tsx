import { Referral } from "@/interfaces";
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

import { GetServerSideProps } from "next";
import sleep from "@/util/sleep";

interface UnassignedProps {
  referrals: Referral[];
}

export default function Unassigned({ referrals }: UnassignedProps) {
  const [unassigned, setUnassigned] = useState(referrals);
  const [filteredUnassigned, setFilteredUnassigned] = useState(referrals);
  const [dateState, setDateState] = useState(true);
  const [attemptsState, setAttemptsState] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const handleSetFilterUBA = () => {
    const filtered = unassigned.filter((ref) => {
      if (
        ref.areaInfo &&
        ref.areaInfo.organizations &&
        ref.areaInfo.organizations[0].id === 31859
      ) {
        return ref;
      }
    });
    setFilteredUnassigned(filtered);
  };

  const handleSetDate = () => {
    setDateState(!dateState);
    if (dateState) {
      const filtered = unassigned.sort((a, b) => {
        if (a.createDate < b.createDate) {
          return -1;
        }
        if (a.createDate > b.createDate) {
          return 1;
        }
        return 0;
      });
      setFilteredUnassigned(filtered);
    } else {
      const filtered = unassigned.sort((a, b) => {
        if (b.createDate < a.createDate) {
          return -1;
        }
        if (b.createDate > a.createDate) {
          return 1;
        }
        return 0;
      });
      setFilteredUnassigned(filtered);
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
      setFilteredUnassigned(filtered);
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
      setFilteredUnassigned(filtered);
    }
  };

  const handleClick = async (ref: Referral) => {
    console.log(ref);
    if (ref.areaInfo && ref.contactInfo) {
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
          ref.lastName
            ? `*${ref.firstName} ${ref.lastName}*`
            : `*${ref.firstName}*`
        } - *OFERTA_PLACEHOLDER*\nNúmero: ${
          ref.contactInfo.phoneNumbers[0].number
        }\n*Cadastro em: ${timestampToDate(
          new Date(ref.createDate).getTime(),
          true
        )}*\nAdicionamos uma tarefa como observação!`;
        await navigator.clipboard.writeText(text);
      } catch (error) {
        console.error(error);
        alert("There was an error copying the text!");
      }
    }
  };

  const handleLoadData = async () => {
    const refreshToken = localStorage.getItem("REFRESH_TOKEN");
    const areaResponse = await fetch(
      `https://mission-api-v2.vercel.app/api/referrals/areaInfoApi?refreshToken=${refreshToken}`,
      {
        method: "POST",
        body: JSON.stringify(referrals),
      }
    );
    if (!areaResponse.ok) {
    } else {
      const referralsCompleteWithArea = await areaResponse.json();
      await sleep(3000);
      const attemptsResponse = await fetch(
        `https://mission-api-v2.vercel.app/api/referrals/referralAttemptApi?refreshToken=${refreshToken}`,
        {
          method: "POST",
          body: JSON.stringify(referralsCompleteWithArea),
        }
      );
      const referralsWithAttempts = await attemptsResponse.json();
      setDataLoaded(true);
      setUnassigned(referralsWithAttempts);
      setFilteredUnassigned(referralsWithAttempts);
    }
  };

  const handleLoadReferralInfo = async (referral: Referral) => {
    const refreshToken = localStorage.getItem("REFRESH_TOKEN");
    const response = await fetch(
      `https://mission-api-v2.vercel.app/api/referrals/referralInfoApi?refreshToken=${refreshToken}`,
      {
        method: "POST",
        body: JSON.stringify(referral),
      }
    );
    const data = await response.json();
    const copyUnassigned = [...unassigned];
    const index = copyUnassigned.findIndex(
      (ref) => ref.personGuid === referral.personGuid
    );
    if (index !== -1) {
      copyUnassigned[index] = data;
    }
    console.log(copyUnassigned);
    setFilteredUnassigned(copyUnassigned);
    setUnassigned(copyUnassigned);
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
          {dataLoaded ? (
            <>
              <Button onClick={handleSetFilterUBA}>Uba</Button>
              <Button onClick={handleSetAttempts}>
                Attempts
                <SwapVertIcon />
              </Button>
            </>
          ) : (
            <Button onClick={handleLoadData}>Load</Button>
          )}
          <Button onClick={handleSetDate}>
            Date
            <SwapVertIcon />
          </Button>
        </ButtonGroup>
      </div>
      <UnassignedList>
        {filteredUnassigned.map((filteredUnassigned) => (
          <div key={filteredUnassigned.createDate}>
            <ReferralItem
              key={filteredUnassigned.createDate}
              referral={filteredUnassigned}
              dataLoaded={dataLoaded}
            />
            {!filteredUnassigned.contactInfo && dataLoaded && (
              <Button
                onClick={() => handleLoadReferralInfo(filteredUnassigned)}
                style={{ marginTop: "10px" }}
                variant="contained"
                endIcon={<ContentPasteIcon />}
              >
                Contact Info
              </Button>
            )}
            {dataLoaded && filteredUnassigned.contactInfo && (
              <Button
                onClick={() => handleClick(filteredUnassigned)}
                style={{ marginTop: "10px" }}
                variant="contained"
                endIcon={<ContentPasteIcon />}
              >
                Copy
              </Button>
            )}
          </div>
        ))}
      </UnassignedList>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { refreshToken } = context.query;
  const isDev = process.env.NODE_ENV === "development";
  const url = isDev
    ? `http://localhost:3000/api/referrals/unassigned?refreshToken=${refreshToken}`
    : `https://mission-api-v2.vercel.app/api/referrals/unassigned?refreshToken=${refreshToken}`;
  try {
    const response = await fetch(url);
    const referrals = await response.json();
    return {
      props: { referrals },
    };
  } catch (error) {
    console.error(error);
    return {
      props: { referrals: [] },
    };
  }
};
