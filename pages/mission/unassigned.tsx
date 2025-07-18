import "@/app/globals.css";
import { Referral, TitleOption } from "@/interfaces";
import Title from "@/components/Title";
import { CSSProperties, useCallback, useMemo, useState } from "react";
import styles from "./unassigned.module.css";
import timestampToDate from "@/util/timestampToDate";
import checkTimestamp3DaysOld from "@/util/checkTimestamp3DaysOld";
import checkTimestampToday from "@/util/checkTimestampToday";
import { useAreas } from "@/hooks/useAreas";
import useReferrals from "@/hooks/useReferrals";
import LoadingPage from "@/components/LoadingPage";
import { GetServerSideProps } from "next";
import { useRouter } from "next/navigation";
import { useUsers } from "@/hooks/useUsers";
import DatePicker from "@/components/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import HeaderButtonGroup from "@/components/HeaderButtonGroup";
import Head from "next/head";
import Dialog from "@/components/Dialog";
import ReferralList from "@/components/ReferralList";
import { Button } from "@/components/ui/button";
import { CopyIcon, PhoneIcon, SendIcon, Trash2Icon } from "lucide-react";
import ReferralItem from "@/components/ReferralItem";
import { useUba } from "@/hooks/useUba";
import fetchPhoneMatch from "@/util/api/fetchPhoneMatch";
import { useOffers } from "@/hooks/useOffers";
import { useStopTeachingReason } from "@/hooks/useStopTeachingReason";

interface UnassignedProps {
  refreshToken: string;
}

const FILTERS = {
  ALL: 0,
  TWO_PLUS: 2,
  NO_EVENTS_THREE_DAYS: 3,
  DATE_FILTER: 4,
};

export default function Unassigned({ refreshToken }: UnassignedProps) {
  const [activeFilter, setActiveFilter] = useState(0);
  const [dateState, setDateState] = useState(true);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [openOfferReferral, setOpenOfferReferral] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentReferral, setCurrentReferral] = useState<Referral | null>(null);
  const [date, setDate] = useState<Dayjs | null>(null);
  const router = useRouter();
  const { referrals, setReferrals, filteredReferrals, setFilteredReferrals, loadingReferrals } = useReferrals(String(refreshToken), router);
  const { areas, areasLoading } = useAreas(router);
  const { users, loading } = useUsers(router);
  const { uba, loadingUba } = useUba(router);
  const { offers, loadingOffers } = useOffers(router);
  const { stopTeachingReasons } = useStopTeachingReason(router);

  const handleSetDateOrder = () => {
    setDateState((prev) => !prev);
    setActiveFilter(0);
    setDate(null);
  };

  const handleCopy = async (ref: Referral) => {
    if (!ref.areaInfo || !ref.contactInfo) return;

    try {
      const areaName = ref.areaName || ref.areaInfo.proselytingAreas?.[0]?.name || "AREA_PLACEHOLDER";

      const phoneNumber = ref.contactInfo.phoneNumbers?.[0]?.number || "PHONE_PLACEHOLDER";

      const text = `@${areaName}\n*${areaName}*\nEnviamos uma referência para vocês pelo Pregar Meu Evangelho!\n${
        ref.lastName ? `*${ref.firstName} ${ref.lastName}*` : `*${ref.firstName}*`
      } - ${ref.offerText ? `*${ref.offerText}*` : `*OFERTA_PLACEHOLDER*`}\nNúmero: ${phoneNumber}\n*Cadastro em: ${timestampToDate(
        new Date(ref.createDate).getTime(),
        true
      )}*`;

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
      const refreshToken = localStorage.getItem("REFRESH_TOKEN");
      if (!refreshToken) throw new Error("No refresh token found.");

      const options = {
        method: "POST",

        body: JSON.stringify(referrals),
      };

      // Fetch area info with retries
      const referralsCompleteWithArea = await fetchWithRetry(`/api/referrals/areaInfoApi?refreshToken=${refreshToken}`, options);

      // Fetch referral attempts with retries
      const referralsWithAttempts = await fetchWithRetry(`/api/referrals/referralAttemptApi?refreshToken=${refreshToken}`, {
        ...options,
        body: JSON.stringify(referralsCompleteWithArea),
      });

      // Update state
      setDataLoaded(true);
      setReferrals(referralsWithAttempts);
    } catch (error) {
      console.error("Error loading data:", error);
      alert("Failed to load data. Please try again.");
    }
  };

  const handleLoadPhone = useCallback(
    async (referral: Referral) => {
      try {
        const refreshToken = localStorage.getItem("REFRESH_TOKEN");

        if (!refreshToken) throw new Error("No refresh token found.");

        // Fetch referral info
        const response = await fetch(`/api/referrals/referralInfoApi?refreshToken=${refreshToken}`, {
          method: "POST",

          body: JSON.stringify(referral),
        });

        if (!response.ok) throw new Error(`Failed to fetch referral info: ${response.statusText}`);

        const data = await response.json();
        const phoneMatches = await fetchPhoneMatch(data.contactInfo.phoneNumbers?.[0]?.number);
        const newData = {
          ...data,
          phoneMatches,
        };
        // Efficiently update state using map()
        setReferrals((prev) => prev.map((ref) => (ref.personGuid === referral.personGuid ? newData : ref)));
      } catch (error) {
        console.error("Error loading referral info:", error);
        alert("Failed to load referral info. Please try again.");
      }
    },
    [setReferrals]
  );

  const handleTwoPlusEvents = () => {
    setActiveFilter(FILTERS.TWO_PLUS);
    setDate(null);
  };

  const handlePostSentReferral = useCallback(
    (referral: Referral, offer?: string, areaName?: string) => {
      // Function to update a referral
      const updateReferral = (item: Referral) =>
        item.personGuid === referral.personGuid ? { ...item, sentStatus: true, offerText: offer, areaName: areaName || "" } : item;

      // Update state efficiently
      setReferrals((prev) => prev.map(updateReferral));
      setDialogOpen(false);
    },
    [setReferrals]
  );

  const handleOpenDialog = useCallback(
    async (referral: Referral) => {
      try {
        const response = await fetch(`/api/db/referralExist?id=${referral.personGuid}`);
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
    },
    [handlePostSentReferral]
  );

  const handleNoEventsThreeDays = () => {
    setActiveFilter(FILTERS.NO_EVENTS_THREE_DAYS);
    setDate(null);
  };

  const handleDelete = useCallback(
    (referral: Referral) => {
      setReferrals(referrals.filter((ref) => ref.personGuid !== referral.personGuid));
    },
    [referrals, setReferrals]
  );

  const handleDateChange = (newValue: Dayjs | null) => {
    setDate(newValue);
    setActiveFilter(FILTERS.DATE_FILTER);
  };

  const handleLoadOffer = useCallback(
    async (ref: Referral) => {
      if (!ref.personOffer && !ref.offerItem) {
        try {
          const response = await fetch(`/api/referrals/offer?id=${ref.personGuid}&refreshToken=${refreshToken}`);

          if (!response.ok) {
            const { error, message } = await response.json();
            alert(message);
            return;
          } else {
            const { offerItem, personOffer } = await response.json();
            const newRef = {
              ...ref,
              offerItem,
              personOffer,
            };
            const copyUnassigned = [...referrals];

            const index = copyUnassigned.findIndex((r) => r.personGuid === ref.personGuid);
            if (index !== -1) {
              copyUnassigned[index] = newRef;
            }

            setReferrals(copyUnassigned);
            setOpenOfferReferral(ref.personGuid);
          }
        } catch (error) {}
      } else {
        setOpenOfferReferral(openOfferReferral === ref.personGuid ? "" : ref.personGuid);
      }
    },
    [openOfferReferral, referrals, refreshToken, setReferrals]
  );

  const handleClearDateFilter = () => {
    setActiveFilter(0);
    setDate(null);
  };

  const filtered = useMemo(() => {
    if (!referrals) return [];

    switch (activeFilter) {
      case FILTERS.TWO_PLUS:
        return referrals.filter((ref) => {
          const attemps = ref.contactAttempts || [];
          return attemps.length >= 3 || (attemps.length >= 2 && !checkTimestampToday(attemps[0].itemDate));
        });

      case FILTERS.NO_EVENTS_THREE_DAYS:
        return referrals.filter((ref) => ref.contactAttempts.length === 0 && checkTimestamp3DaysOld(ref.createDate));

      case FILTERS.DATE_FILTER:
        if (!date) return [...referrals];
        return referrals.filter((ref) => date.isSame(dayjs(ref.createDate), "day"));

      case FILTERS.ALL:
      default:
        return [...referrals].sort((a, b) => (dateState ? b.createDate - a.createDate : a.createDate - b.createDate));
    }
  }, [referrals, activeFilter, date, dateState]);

  const referralItems = useMemo(() => {
    return filtered.map((ref) => (
      <ReferralItem key={ref.personGuid} ref={ref}>
        <div className="flex flex-row gap-1">
          <Button className="w-fit cursor-pointer text-red-600 hover:bg-red-600 hover:text-white" onClick={() => handleDelete(ref)} variant="outline">
            <Trash2Icon />
          </Button>
          {dataLoaded && ref.contactInfo && (
            <Button className="w-fit cursor-pointer text-yellow-600 hover:bg-yellow-600 hover:text-white" onClick={() => handleCopy(ref)} variant="outline">
              <CopyIcon />
            </Button>
          )}
          {dataLoaded && !ref.contactInfo && (
            <Button className="w-fit cursor-pointer text-green-600 hover:bg-green-600 hover:text-white" onClick={() => handleLoadPhone(ref)} variant="outline">
              <PhoneIcon />
            </Button>
          )}
          {dataLoaded && !ref.offerItem && !ref.personOffer && (
            <Button
              className="w-fit cursor-pointer text-blue-600 hover:text-blue-600 hover:font-semibold"
              onClick={() => handleLoadOffer(ref)}
              variant="outline"
            >
              Offer
            </Button>
          )}
          {dataLoaded && ref.contactInfo && !ref.sentStatus && (
            <Button className="w-fit cursor-pointer text-blue-600 hover:bg-blue-600 hover:text-white" onClick={() => handleOpenDialog(ref)} variant="outline">
              <SendIcon />
            </Button>
          )}
        </div>
      </ReferralItem>
    ));
  }, [filtered, dataLoaded, handleDelete, handleLoadOffer, handleLoadPhone, handleOpenDialog]);

  const title = useMemo(() => {
    return `${Object.values(TitleOption)[activeFilter]} (${filtered.length})`;
  }, [activeFilter, filtered]);

  return (
    <>
      <Head>
        <title>Referral Manager | Unassigned</title>
        <meta name="description" content="Created by Elder Gouveia." />
      </Head>
      {loadingReferrals && <LoadingPage />}
      {currentReferral && (
        <Dialog
          key={currentReferral.personGuid}
          setOpen={setDialogOpen}
          ref={currentReferral}
          users={users}
          areas={areas}
          offers={offers}
          reasons={stopTeachingReasons}
          uba={uba}
          open={dialogOpen}
          postSent={handlePostSentReferral}
        />
      )}
      {!loadingReferrals && (
        <div>
          <div className={styles.headerContainer}>
            <div className={styles.titleContainer}>
              <Title title={title} />
            </div>
            <div className={styles.headerFilterContainer}>
              <HeaderButtonGroup
                dataLoaded={dataLoaded}
                onLoadData={handleLoadData}
                onSetDateOrder={handleSetDateOrder}
                onThreePlusEvents={handleTwoPlusEvents}
                onNoEventsThreeDays={handleNoEventsThreeDays}
              />
              <DatePicker onDateChange={handleDateChange} dataLoaded={dataLoaded} value={date} onClear={handleClearDateFilter} />
            </div>
          </div>

          <div className={styles.container}>
            <ReferralList>{referralItems}</ReferralList>
          </div>
        </div>
      )}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const { refreshToken } = context.query;
  if (!refreshToken) {
    return {
      redirect: {
        destination: "/",
        permanent: false,
      },
    };
  }
  return {
    props: { refreshToken },
  };
};
