import { Referral, TitleOption, WindowSettings } from "@/interfaces";
import UnassignedList from "@/components/UnassignedList";
import ReferralItem from "@/components/ReferralItem";
import Button from "@mui/material/Button";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Title from "@/components/Title";
import { useState } from "react";
import styles from "./unassigned.module.css";
import ButtonGroup from "@mui/material/ButtonGroup";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import DeleteIcon from "@mui/icons-material/Delete";
import timestampToDate from "@/util/timestampToDate";
import sleep from "@/util/sleep";
import PhoneIcon from "@mui/icons-material/Phone";
import "../../app/globals.css";
import SimpleDialog from "@/components/SimpleDialog";
import SendIcon from "@mui/icons-material/Send";
import checkTimestamp3DaysOld from "@/util/checkTimestamp3DaysOld";
import checkTimestampToday from "@/util/checkTimestampToday";
import useEffectWindowTitle from "@/hooks/useEffectWindowTitle";
import { useAreas } from "@/hooks/useAreas";
import useReferrals from "@/hooks/useReferrals";
import LoadingPage from "@/components/LoadingPage";
import { GetServerSideProps } from "next";

interface UnassignedProps {
  refreshToken: string;
}

export default function Unassigned({ refreshToken }: UnassignedProps) {
  const [activeFilter, setActiveFilter] = useState(0);
  const [dateState, setDateState] = useState(true);
  const [attemptsState, setAttemptsState] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [openOfferReferral, setOpenOfferReferral] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentReferral, setCurrentReferral] = useState<Referral | null>(null);
  const { referrals, setReferrals, filteredReferrals, setFilteredReferrals, loadingReferrals } = useReferrals(String(refreshToken));
  const { areas, areasLoading } = useAreas();

  useEffectWindowTitle(WindowSettings.UNASSIGNED_WINDOW);

  const handleSetFilterUBA = () => {
    const filtered = referrals.filter((ref) => ref.areaInfo?.organizations?.[0]?.id === 31859);

    setFilteredReferrals(filtered);
    setActiveFilter(1);
  };

  const handleSetDate = () => {
    setDateState((prev) => !prev);
    setActiveFilter(0);

    // Create a new sorted array without mutating the original state
    const sortedReferrals = [...referrals].sort((a, b) => (dateState ? a.createDate - b.createDate : b.createDate - a.createDate));

    setFilteredReferrals(sortedReferrals);
  };

  const handleSetAttempts = () => {
    setAttemptsState((prev) => !prev);
    setActiveFilter(0);

    const sortedReferrals = [...referrals].sort((a, b) =>
      attemptsState ? a.contactAttempts.length - b.contactAttempts.length : b.contactAttempts.length - a.contactAttempts.length
    );

    setFilteredReferrals(sortedReferrals);
  };

  const handleClick = async (ref: Referral) => {
    if (!ref.areaInfo || !ref.contactInfo) return;

    try {
      const areaName = ref.areaName || ref.areaInfo.proselytingAreas?.[0]?.name || "AREA_PLACEHOLDER";

      const phoneNumber = ref.contactInfo.phoneNumbers?.[0]?.number || "PHONE_PLACEHOLDER";

      const text = `@${areaName}\n*${areaName}*\nEnviamos uma referência para vocês pelo Pregar Meu Evangelho!\n${
        ref.lastName ? `*${ref.firstName} ${ref.lastName}*` : `*${ref.firstName}*`
      } - ${ref.offerText ? `*${ref.offerText}*` : `*OFERTA_PLACEHOLDER*`}\nNúmero: ${phoneNumber}\n*Cadastro em: ${timestampToDate(
        new Date(ref.createDate).getTime(),
        true
      )}*\nAdicionamos uma tarefa como observação!`;

      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error(error);
      alert("There was an error copying the text!");
    }
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const fetchWithRetry = async (url: string, options: RequestInit, retries = 3, delay = 2000) => {
    for (let i = 0; i < retries; i++) {
      try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
        return response.json();
      } catch (error) {
        console.warn(`Attempt ${i + 1} failed: ${error}`);
        if (i < retries - 1) await sleep(delay);
      }
    }
    throw new Error("Max retries reached");
  };

  const handleLoadData = async () => {
    try {
      const isDev = process.env.NODE_ENV === "development";
      const url = isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
      const refreshToken = localStorage.getItem("REFRESH_TOKEN");
      if (!refreshToken) throw new Error("No refresh token found.");

      const options = {
        method: "POST",

        body: JSON.stringify(referrals),
      };

      // Fetch area info with retries
      const referralsCompleteWithArea = await fetchWithRetry(`${url}/api/referrals/areaInfoApi?refreshToken=${refreshToken}`, options);

      // Fetch referral attempts with retries
      const referralsWithAttempts = await fetchWithRetry(`${url}/api/referrals/referralAttemptApi?refreshToken=${refreshToken}`, {
        ...options,
        body: JSON.stringify(referralsCompleteWithArea),
      });

      // Update state
      setDataLoaded(true);
      setReferrals(referralsWithAttempts);
      setFilteredReferrals(referralsWithAttempts);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load data. Please try again.");
    }
  };

  const handleLoadReferralInfo = async (referral: Referral) => {
    try {
      const isDev = process.env.NODE_ENV === "development";
      const url = isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
      const refreshToken = localStorage.getItem("REFRESH_TOKEN");

      if (!refreshToken) throw new Error("No refresh token found.");

      // Fetch referral info
      const response = await fetch(`${url}/api/referrals/referralInfoApi?refreshToken=${refreshToken}`, {
        method: "POST",

        body: JSON.stringify(referral),
      });

      if (!response.ok) throw new Error(`Failed to fetch referral info: ${response.statusText}`);

      const data = await response.json();

      // Efficiently update state using map()
      setReferrals((prev) => prev.map((ref) => (ref.personGuid === referral.personGuid ? data : ref)));

      setFilteredReferrals((prev) => prev.map((ref) => (ref.personGuid === referral.personGuid ? data : ref)));
    } catch (error) {
      console.error("Error loading referral info:", error);
      alert("Failed to load referral info. Please try again.");
    }
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
      const copyUnassigned = [...referrals];
      const copyFiltered = [...filteredReferrals];
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
      setFilteredReferrals(copyFiltered);
      setReferrals(copyUnassigned);
      setOpenOfferReferral(referral.personGuid);
    } else {
      if (openOfferReferral === referral.personGuid) {
        setOpenOfferReferral("");
      } else {
        setOpenOfferReferral(referral.personGuid);
      }
    }
  };

  const handle2Attempts = () => {
    const copyUnassigned = [...referrals];
    const filteredCopy = copyUnassigned.filter(
      (ref) => ref.contactAttempts && ref.contactAttempts.length === 2 && !checkTimestampToday(ref.contactAttempts[0].itemDate)
    );
    setFilteredReferrals(filteredCopy);
    setActiveFilter(2);
  };

  const handleOpenDialog = async (referral: Referral) => {
    try {
      const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
      const response = await fetch(`${API_URL}/api/db/referralExist?id=${referral.personGuid}`);
      if (!response.ok) throw new Error(`${response.statusText}`);
      const { exist, who_sent } = await response.json();
      if (exist) {
        handlePostSentReferral(referral);
        alert(`${who_sent} sent this referral already!`);
        return;
      }
      setCurrentReferral(referral);
      setDialogOpen(true);
    } catch (error) {
      console.error(error);
      alert(error);
    }
  };

  const handleWithoutAttempts3days = () => {
    const copy = [...referrals];
    const filteredCopy = copy.filter((ref) => ref.contactAttempts.length === 0 && checkTimestamp3DaysOld(ref.createDate));
    setFilteredReferrals(filteredCopy);
    setActiveFilter(3);
  };

  const handlePostSentReferral = (referral: Referral, offer?: string, areaId?: number) => {
    // Find the area once
    const updatedAreaName = areas?.find((area) => area.id === areaId)?.name || "";

    // Function to update a referral
    const updateReferral = (item: Referral) =>
      item.personGuid === referral.personGuid ? { ...item, sentStatus: true, offerText: offer, areaName: updatedAreaName } : item;

    // Update state efficiently
    setReferrals((prev) => prev.map(updateReferral));
    setFilteredReferrals((prev) => prev.map(updateReferral));
  };

  const handleDeleteFromList = (referral: Referral) => {
    const copyReferrals = [...referrals];
    const copyFiltered = [...filteredReferrals];

    setReferrals(copyReferrals.filter((ref) => ref.personGuid !== referral.personGuid));
    setFilteredReferrals(copyFiltered.filter((ref) => ref.personGuid !== referral.personGuid));
  };

  return loadingReferrals ? (
    <LoadingPage />
  ) : (
    <div className={styles.container}>
      {currentReferral && (
        <SimpleDialog
          postSent={handlePostSentReferral}
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
          <Title containerStyles={{ color: "#1D3557" }} title={`${Object.values(TitleOption)[activeFilter]} (${filteredReferrals.length})`} />
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
              {TitleOption.OPTION_2}
            </Button>
          )}
          {dataLoaded && (
            <Button onClick={handle2Attempts} style={{ backgroundColor: "#1D3557" }}>
              {TitleOption.OPTION_3}
            </Button>
          )}
          {dataLoaded && (
            <Button onClick={handleWithoutAttempts3days} style={{ backgroundColor: "#1D3557" }}>
              {TitleOption.OPTION_4}
            </Button>
          )}
        </ButtonGroup>
      </div>
      <UnassignedList>
        {filteredReferrals.map((ref) => (
          <div key={ref.personGuid}>
            <ReferralItem key={ref.personGuid} referral={ref} dataLoaded={dataLoaded} openOfferReferral={openOfferReferral} />
            {dataLoaded && (
              <ButtonGroup variant="outlined" aria-label="Basic button group">
                {dataLoaded && ref.contactInfo && (
                  <Button onClick={() => handleClick(ref)} variant="contained" style={{ minHeight: "40px", backgroundColor: "#457B9D" }}>
                    <ContentCopyIcon />
                  </Button>
                )}
                {!ref.contactInfo && dataLoaded && (
                  <Button onClick={() => handleLoadReferralInfo(ref)} variant="contained" style={{ minHeight: "40px", backgroundColor: "#457B9D" }}>
                    <PhoneIcon />
                  </Button>
                )}

                {dataLoaded && (
                  <Button onClick={() => handleOfferItem(ref)} variant="outlined" style={{ minHeight: "40px", borderColor: "#457B9D", color: "#457B9D" }}>
                    Offer
                  </Button>
                )}
                {dataLoaded && ref.contactInfo && !ref.sentStatus && (
                  <Button onClick={() => handleOpenDialog(ref)} variant="outlined" style={{ minHeight: "40px", borderColor: "#457B9D" }}>
                    <SendIcon style={{ color: "#457B9D" }} />
                  </Button>
                )}
                {dataLoaded && ref.sentStatus && (
                  <Button onClick={() => handleDeleteFromList(ref)} variant="contained" style={{ minHeight: "40px", backgroundColor: "#e63946" }}>
                    <DeleteIcon style={{ color: "white" }} />
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
  return {
    props: { refreshToken },
  };
};
