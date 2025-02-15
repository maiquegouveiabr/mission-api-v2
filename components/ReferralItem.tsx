import { Referral } from "@/interfaces";
import styles from "./styles/UnassignedReferralItem.module.css";
import timestampToDate from "@/util/timestampToDate";
import Offer from "./Offer";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import checkTimestampToday from "@/util/checkTimestampToday";
import SpanItem from "./SpanItem";

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
          ) : (
            referral.contactAttempts && referral.contactAttempts.length >= 3 && <ErrorOutlineIcon color="warning" />
          )}
        </div>

        <SpanItem label={timestampToDate(new Date(referral.createDate).getTime(), true)} spanStyle={{ fontWeight: "bold" }} />

        {referral.contactInfo && <SpanItem label={referral.contactInfo.phoneNumbers[0].number} spanStyle={{ fontWeight: "bold" }} />}

        <SpanItem label={referral.address.toUpperCase()} spanStyle={{ fontWeight: "bold" }} />

        {referral.contactAttempts && (
          <SpanItem
            label={`CONTACT ATTEMPTS (${referral.contactAttempts.length})`}
            containerStyle={{ backgroundColor: "#1D3557" }}
            spanStyle={{ fontWeight: "bold" }}
          />
        )}

        {referral.areaInfo && referral.areaInfo.proselytingAreas && (
          <SpanItem
            label={`SUGGESTED AREA (${referral.areaInfo.proselytingAreas[0].name})`}
            containerStyle={{ backgroundColor: "#1D3557" }}
            spanStyle={{ fontWeight: "bold" }}
          />
        )}

        {referral.contactAttempts && referral.contactAttempts.length > 0 && checkTimestampToday(referral.contactAttempts[0].itemDate) && (
          <SpanItem label="LAST ATTEMPT TODAY" containerStyle={{ backgroundColor: "#E63946" }} spanStyle={{ fontWeight: "bold" }} />
        )}
        {referral.personOffer && referral.offerItem && openOfferReferral === referral.personGuid && <Offer referral={referral} />}
      </li>
    </div>
  );
};

export default UnassignedReferralItem;
