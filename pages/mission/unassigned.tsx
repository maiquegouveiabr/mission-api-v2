import { Area, Referral } from "@/interfaces";
import UnassignedList from "@/components/UnassignedList";
import ReferralItem from "@/components/ReferralItem";
import Button from "@mui/material/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Title from "@/components/Title";
import { useEffect, useState } from "react";
import styles from "./unassigned.module.css";
import ButtonGroup from "@mui/material/ButtonGroup";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import timestampToDate from "@/util/timestampToDate";
import { GetServerSideProps } from "next";
import sleep from "@/util/sleep";
import PhoneIcon from "@mui/icons-material/Phone";
import icon from "@/img/naruto-icon.png";
import "../../app/globals.css";
import SimpleDialog from "@/components/SimpleDialog";
import SendIcon from "@mui/icons-material/Send";
import checkTimestamp3DaysOld from "@/util/checkTimestamp3DaysOld";

interface UnassignedProps {
  referrals: Referral[];
}

export default function Unassigned({ referrals }: UnassignedProps) {
  const [unassigned, setUnassigned] = useState(referrals);
  const [filteredUnassigned, setFilteredUnassigned] = useState(referrals);
  const [dateState, setDateState] = useState(true);
  const [attemptsState, setAttemptsState] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [openOfferReferral, setOpenOfferReferral] = useState("");
  const [areas, setAreas] = useState<Area[] | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentReferral, setCurrentReferral] = useState<Referral | null>(null);

  useEffect(() => {
    document.title = "Shrek Plus - Referral Manager";
    const link: HTMLLinkElement | null = document.querySelector("link[rel~='icon']");
    if (link) {
      link.href = icon.src;
      link.className = styles.icon;
    } else {
      const newLink = document.createElement("link");
      newLink.rel = "icon";
      newLink.href = icon.src;
      document.head.appendChild(newLink);
    }
  }, []);

  useEffect(() => {
    fetchAreas();
  }, []);

  const fetchAreas = async () => {
    const isDev = process.env.NODE_ENV === "development";
    const url = isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
    const response = await fetch(`${url}/api/db/areas`);
    const data = await response.json();
    setAreas(data);
  };

  const handleSetFilterUBA = () => {
    const copyUnassigned = [...unassigned];
    const filtered = copyUnassigned.filter((ref) => {
      if (ref.areaInfo && ref.areaInfo.organizations && ref.areaInfo.organizations[0].id === 31859) {
        return ref;
      }
    });
    setFilteredUnassigned(filtered);
  };

  const handleSetDate = () => {
    const copyUnassigned = [...unassigned];
    setDateState(!dateState);
    if (dateState) {
      const filtered = copyUnassigned.sort((a, b) => {
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
      const filtered = copyUnassigned.sort((a, b) => {
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
    const copyUnassigned = [...unassigned];
    setAttemptsState(!attemptsState);
    if (attemptsState) {
      const filtered = copyUnassigned.sort((a, b) => {
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
      const filtered = copyUnassigned.sort((a, b) => {
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
    if (ref.areaInfo && ref.contactInfo) {
      try {
        const text = `@${ref.areaInfo.proselytingAreas ? `${ref.areaInfo.proselytingAreas[0].name}` : "AREA_PLACEHOLDER"}\n${
          ref.areaInfo.proselytingAreas ? `*${ref.areaInfo.proselytingAreas[0].name}*` : "*AREA_PLACEHOLDER*"
        }\nEnviamos uma referência para vocês pelo Pregar Meu Evangelho!\n${
          ref.lastName ? `*${ref.firstName} ${ref.lastName}*` : `*${ref.firstName}*`
        } - *OFERTA_PLACEHOLDER*\nNúmero: ${ref.contactInfo.phoneNumbers[0].number}\n*Cadastro em: ${timestampToDate(
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
    const isDev = process.env.NODE_ENV === "development";
    const url = isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
    const refreshToken = localStorage.getItem("REFRESH_TOKEN");
    const areaResponse = await fetch(`${url}/api/referrals/areaInfoApi?refreshToken=${refreshToken}`, {
      method: "POST",
      body: JSON.stringify(referrals),
    });
    if (!areaResponse.ok) {
    } else {
      const referralsCompleteWithArea = await areaResponse.json();
      await sleep(3000);
      const attemptsResponse = await fetch(`${url}/api/referrals/referralAttemptApi?refreshToken=${refreshToken}`, {
        method: "POST",
        body: JSON.stringify(referralsCompleteWithArea),
      });
      const referralsWithAttempts = await attemptsResponse.json();
      setDataLoaded(true);
      setUnassigned(referralsWithAttempts);
      setFilteredUnassigned(referralsWithAttempts);
    }
  };

  const handleLoadReferralInfo = async (referral: Referral) => {
    const isDev = process.env.NODE_ENV === "development";
    const url = isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
    const refreshToken = localStorage.getItem("REFRESH_TOKEN");
    const response = await fetch(`${url}/api/referrals/referralInfoApi?refreshToken=${refreshToken}`, {
      method: "POST",
      body: JSON.stringify(referral),
    });
    const data = await response.json();
    const copyUnassigned = [...unassigned];
    const index = copyUnassigned.findIndex((ref) => ref.personGuid === referral.personGuid);
    if (index !== -1) {
      copyUnassigned[index] = data;
    }
    const copyFiltered = [...filteredUnassigned];
    const indexFiltered = copyFiltered.findIndex((ref) => ref.personGuid === referral.personGuid);
    if (indexFiltered !== -1) {
      copyFiltered[indexFiltered] = data;
    }

    setFilteredUnassigned(copyFiltered);
    setUnassigned(copyUnassigned);
  };

  const handleOfferItem = async (referral: Referral) => {
    if (!referral.personOffer && !referral.offerItem) {
      const isDev = process.env.NODE_ENV === "development";
      const url = isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
      const refreshToken = localStorage.getItem("REFRESH_TOKEN");
      const response = await fetch(`${url}/api/referrals/offerItemApi?refreshToken=${refreshToken}`, {
        method: "POST",
        body: JSON.stringify(referral),
      });
      const referralWithOffer: Referral | null = await response.json();
      const copyUnassigned = [...unassigned];
      const copyFiltered = [...filteredUnassigned];
      if (referralWithOffer) {
        const index = copyUnassigned.findIndex((ref) => ref.personGuid === referral.personGuid);
        if (index !== -1) {
          copyUnassigned[index] = referralWithOffer;
        }
        const indexFiltered = copyFiltered.findIndex((ref) => ref.personGuid === referral.personGuid);
        if (index !== -1) {
          copyFiltered[indexFiltered] = referralWithOffer;
        }
      }
      setFilteredUnassigned(copyFiltered);
      setUnassigned(copyUnassigned);
      setOpenOfferReferral(referral.personGuid);
    } else {
      if (openOfferReferral === referral.personGuid) {
        setOpenOfferReferral("");
      } else {
        setOpenOfferReferral(referral.personGuid);
      }
    }
  };

  const handleRooftop = () => {
    const filtered = [...unassigned];
    const arr = filtered.filter((ref) => {
      if (!ref.areaInfo) return false;
      if (ref.areaInfo.organizations && ref.areaInfo.organizations[0].id === 31859) return false;
      if (ref.areaInfo.actualMatchAccuracy === "Rooftop" && ref.areaInfo.actualConfidence === "HIGH") return true;
    });
    setFilteredUnassigned(arr);
  };

  const handleOpenDialog = async (referral: Referral) => {
    try {
      const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
      const response = await fetch(`${API_URL}/api/db/referralExist?id=${referral.personGuid}`);
      if (!response.ok) throw new Error(`${response.statusText}`);
      const { exist, who_sent } = await response.json();
      if (exist) {
        alert(`${who_sent} sent this referral already!`);
        return;
      }
      setCurrentReferral(referral);
      setDialogOpen(true);
    } catch (error) {
      console.error(error);
      alert("INTERNAL_SERVER_ERROR");
    }
  };

  const handleWithoutAttempts3days = () => {
    const copy = [...unassigned];
    const filteredCopy = copy.filter((ref) => ref.contactAttempts.length === 0 && checkTimestamp3DaysOld(ref.createDate));
    setFilteredUnassigned(filteredCopy);
  };

  return (
    <div className={styles.container}>
      {currentReferral && (
        <SimpleDialog
          data={areas ? areas : []}
          open={dialogOpen}
          onClose={() => {
            setDialogOpen(false);
            setCurrentReferral(null);
          }}
          referral={currentReferral}
        />
      )}
      <div className={styles.titleContainer}>
        <div
          style={{
            width: "50%",
            display: "flex",
            justifyContent: "flex-start",
            alignItems: "flex-start",
          }}
        >
          <Title containerStyles={{ color: "#1D3557" }} title={`UNASSIGNED REFERRALS (${filteredUnassigned.length})`} />
        </div>
        <ButtonGroup variant="contained" aria-label="Basic button group" color="inherit" style={{ padding: "10px", color: "white" }}>
          {dataLoaded && (
            <Button onClick={handleSetAttempts} style={{ backgroundColor: "#1D3557" }}>
              Attempts
              <SwapVertIcon />
            </Button>
          )}
          {!dataLoaded && (
            <Button onClick={handleLoadData} style={{ backgroundColor: "#1D3557" }}>
              Load
            </Button>
          )}
          <Button onClick={handleSetDate} style={{ backgroundColor: "#1D3557" }}>
            Date
            <SwapVertIcon />
          </Button>
          {dataLoaded && (
            <Button onClick={handleSetFilterUBA} style={{ backgroundColor: "#1D3557" }}>
              Uba
            </Button>
          )}
          {dataLoaded && (
            <Button onClick={handleRooftop} style={{ backgroundColor: "#1D3557" }}>
              Rooftop
            </Button>
          )}
          {dataLoaded && (
            <Button onClick={handleWithoutAttempts3days} style={{ backgroundColor: "#1D3557" }}>
              3 Days+ w/o attempts
            </Button>
          )}
        </ButtonGroup>
      </div>
      <UnassignedList>
        {filteredUnassigned.map((filteredUnassigned) => (
          <div key={filteredUnassigned.personGuid}>
            <ReferralItem
              key={filteredUnassigned.personGuid}
              referral={filteredUnassigned}
              dataLoaded={dataLoaded}
              openOfferReferral={openOfferReferral}
            />
            {dataLoaded && (
              <ButtonGroup variant="outlined" aria-label="Basic button group">
                {dataLoaded && filteredUnassigned.contactInfo && (
                  <Button
                    onClick={() => handleClick(filteredUnassigned)}
                    variant="contained"
                    style={{ minHeight: "40px", backgroundColor: "#457B9D" }}
                  >
                    <ContentCopyIcon />
                  </Button>
                )}
                {!filteredUnassigned.contactInfo && dataLoaded && (
                  <Button
                    onClick={() => handleLoadReferralInfo(filteredUnassigned)}
                    variant="contained"
                    style={{ minHeight: "40px", backgroundColor: "#457B9D" }}
                  >
                    <PhoneIcon />
                  </Button>
                )}

                {dataLoaded && (
                  <Button
                    onClick={() => handleOfferItem(filteredUnassigned)}
                    variant="outlined"
                    style={{ minHeight: "40px", borderColor: "#457B9D", color: "#457B9D" }}
                  >
                    Offer
                  </Button>
                )}
                {dataLoaded && filteredUnassigned.contactInfo && (
                  <Button
                    onClick={() => handleOpenDialog(filteredUnassigned)}
                    variant="outlined"
                    style={{ minHeight: "40px", borderColor: "#457B9D" }}
                  >
                    <SendIcon style={{ color: "#457B9D" }} />
                  </Button>
                )}
              </ButtonGroup>
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
  const url = isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
  try {
    const response = await fetch(`${url}/api/referrals/unassigned?refreshToken=${refreshToken}`);
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
