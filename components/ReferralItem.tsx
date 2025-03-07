import { Referral } from "@/interfaces";
import styles from "./styles/ReferralItem.module.css";
import timestampToDate from "@/util/timestampToDate";
import Offer from "./Offer";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import checkTimestampToday from "@/util/checkTimestampToday";
import SpanItem from "./SpanItem";

import EventDropdown from "./EventDropdown";

interface UnassignedReferralItemProps {
  referral: Referral;
  dataLoaded: boolean;
  openOfferReferral: string;
}

const ReferralItem = ({ referral, openOfferReferral }: UnassignedReferralItemProps) => {
  return (
    <li className={styles.container}>
      <div className={styles.wrap}>
        <a className={styles.linkItem} target="_blank" href={`https://referralmanager.churchofjesuschrist.org/person/${referral.personGuid}`}>
          <p className={styles.spanItem}>
            {referral.firstName} {referral.lastName ? referral.lastName : ""}
          </p>
        </a>
        {referral.contactAttempts && referral.contactAttempts.length >= 2 && !checkTimestampToday(referral.contactAttempts[0].itemDate) ? (
          <ErrorOutlineIcon color="warning" />
        ) : (
          referral.contactAttempts && referral.contactAttempts.length >= 3 && <ErrorOutlineIcon color="warning" />
        )}
      </div>

      <SpanItem label={timestampToDate(new Date(referral.createDate).getTime(), true)} />

      {referral.contactInfo && <SpanItem label={referral.contactInfo.phoneNumbers[0].number} />}

      <SpanItem label={referral.address} />

      {referral.areaInfo && referral.areaInfo.proselytingAreas && <SpanItem label={`Suggested Area (${referral.areaInfo.proselytingAreas[0].name})`} />}
      {referral.contactAttempts && referral.contactAttempts.length > 0 && <EventDropdown events={referral.contactAttempts} />}
      {referral.personOffer && referral.offerItem && openOfferReferral === referral.personGuid && <Offer referral={referral} />}
    </li>
  );
};

export default ReferralItem;
