import { ContactAttempt, Referral } from "@/interfaces";
import fetchData from "./fetchData";
import filterUniqueEvent from "../filterUniqueEvent";

export default async (referrals: Referral[], refreshToken: string) => {
  return Promise.all(
    referrals.map(async (ref) => {
      const url = `https://referralmanager.churchofjesuschrist.org/services/progress/timeline/${ref.personGuid}`;
      const contactAttempts: ContactAttempt[] = await fetchData(url, refreshToken);
      if (contactAttempts) {
        const latestNewReferral = contactAttempts.find(({ timelineItemType }) => timelineItemType === "NEW_REFERRAL") || null;

        if (latestNewReferral) {
          const filteredAttempts = filterUniqueEvent(
            contactAttempts.filter(
              ({ itemDate, eventStatus, timelineItemType }) =>
                itemDate > latestNewReferral.itemDate && eventStatus === false && (timelineItemType === "CONTACT" || timelineItemType === "TEACHING")
            ) || []
          );
          return {
            ...ref,
            contactAttempts: filteredAttempts,
            referralTimestamp: latestNewReferral.itemDate,
          };
        }
      }
      return ref;
    })
  );
};
