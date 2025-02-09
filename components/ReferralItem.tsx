import { Referral } from "@/interfaces";
import styles from "./styles/UnassignedReferralItem.module.css";
import timestampToDate from "@/util/timestampToDate";
import Offer from "./Offer";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import checkTimestampToday from "@/util/checkTimestampToday";

interface UnassignedReferralItemProps {
  referral: Referral;
  dataLoaded: boolean;
  openOfferReferral: string;
}

const UnassignedReferralItem = ({ referral, openOfferReferral }: UnassignedReferralItemProps) => {
  return (
    <div className={styles.container}>
      <li>
        <div className={styles.wrap}>
          <a
            className={styles.linkItem}
            target="_blank"
            href={`https://referralmanager.churchofjesuschrist.org/person/${referral.personGuid}`}
          >
            <p className={styles.spanItem}>
              {referral.firstName} {referral.lastName ? referral.lastName : ""}
            </p>
          </a>
          {referral.contactAttempts &&
          referral.contactAttempts.length >= 2 &&
          !checkTimestampToday(referral.contactAttempts[0].itemDate) ? (
            <ErrorOutlineIcon color="warning" />
          ) : null}
        </div>

        <span className={styles.spanItem}>{timestampToDate(new Date(referral.createDate).getTime(), true)}</span>
        <br />
        {referral.contactInfo && (
          <>
            <span className={styles.spanItem}>{referral.contactInfo.phoneNumbers[0].number}</span>
            <br />
          </>
        )}
        <span className={styles.spanItem}>{referral.address}</span>
        <br />
        {referral.contactAttempts && <span className={styles.spanItem}>Attempts: {referral.contactAttempts.length}</span>}

        {referral.areaInfo && referral.areaInfo.proselytingAreas && (
          <>
            <br />
            <span className={styles.spanItem} style={{ fontWeight: "bold" }}>
              Suggested Area: {referral.areaInfo.proselytingAreas[0].name}
            </span>
          </>
        )}
        {referral.personOffer && referral.offerItem && openOfferReferral === referral.personGuid && <Offer referral={referral} />}
      </li>
    </div>
  );
};

export default UnassignedReferralItem;
