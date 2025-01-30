import { Referral } from "@/interfaces";
import styles from "./styles/UnassignedReferralItem.module.css";
import timestampToDate from "@/util/timestampToDate";

interface UnassignedReferralItemProps {
  referral: Referral;
  dataLoaded: boolean;
}

const UnassignedReferralItem = ({ referral }: UnassignedReferralItemProps) => {
  return (
    <div className={styles.container}>
      <li>
        <a
          className={styles.linkItem}
          target="_blank"
          href={`https://referralmanager.churchofjesuschrist.org/person/${referral.personGuid}`}
        >
          <p className={styles.spanItem}>
            {referral.firstName} {referral.lastName ? referral.lastName : ""}
          </p>
        </a>
        <br />
        <span className={styles.spanItem}>
          {timestampToDate(new Date(referral.createDate).getTime(), true)}
        </span>
        <br />
        {referral.contactInfo && (
          <>
            <span className={styles.spanItem}>
              {referral.contactInfo.phoneNumbers[0].number}
            </span>
            <br />
          </>
        )}
        <span className={styles.spanItem}>{referral.address}</span>
        <br />
        {referral.contactAttempts && (
          <span className={styles.spanItem}>
            Tentativas: {referral.contactAttempts.length}
          </span>
        )}
        <br />
        {referral.areaInfo && referral.areaInfo.proselytingAreas && (
          <span className={`${styles.spanItem}`} style={{ fontWeight: "bold" }}>
            Suggested Area: {referral.areaInfo.proselytingAreas[0].name}
          </span>
        )}
      </li>
    </div>
  );
};

export default UnassignedReferralItem;
