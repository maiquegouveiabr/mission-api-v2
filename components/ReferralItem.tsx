import {
  AreaInfo,
  ContactAttempt,
  ReferralCompleteNoPerson,
} from "@/interfaces";
import styles from "./styles/UnassignedReferralItem.module.css";
import timestampToDate from "@/util/timestampToDate";

interface UnassignedReferralItemProps {
  areaInfo: AreaInfo;
  contactAttempts: ContactAttempt[];
  referral: ReferralCompleteNoPerson;
}

const UnassignedReferralItem = ({
  referral,
  areaInfo,
  contactAttempts,
}: UnassignedReferralItemProps) => {
  return (
    <div className={styles.container}>
      <li>
        <a
          className={styles.linkItem}
          target="_blank"
          href={`https://referralmanager.churchofjesuschrist.org/person/${referral.id}`}
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
        <span className={styles.spanItem}>
          {referral.contactInfo.phoneNumbers[0].number}
        </span>
        <br />
        <span className={styles.spanItem}>
          {referral.householdInfo.address}
        </span>
        <br />
        <span className={styles.spanItem}>
          Tentativas: {contactAttempts.length}
        </span>
        <br />
        {areaInfo.proselytingAreas && (
          <span className={`${styles.spanItem}`} style={{ fontWeight: "bold" }}>
            Suggested Area: {areaInfo.proselytingAreas[0].name}
          </span>
        )}
      </li>
    </div>
  );
};

export default UnassignedReferralItem;
