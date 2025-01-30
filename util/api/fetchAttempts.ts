import { ContactAttempt, Referral } from "@/interfaces";
import fetchData from "./fetchData";
import filterUniqueEvent from "../filterUniqueEvent";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (referrals: Referral[], refreshToken: string) => {
  return Promise.all(
    referrals.map(async (ref) => {
      const contactAttempts: ContactAttempt[] = await fetchData(
        `https://referralmanager.churchofjesuschrist.org/services/progress/timeline/${ref.personGuid}`,
        refreshToken
      );
      if (contactAttempts) {
        const latestNewReferral =
          contactAttempts.find(
            ({ timelineItemType }) => timelineItemType === "NEW_REFERRAL"
          ) || null;

        if (latestNewReferral) {
          const filteredAttempts = filterUniqueEvent(
            contactAttempts.filter(
              ({ itemDate, eventStatus, timelineItemType }) =>
                itemDate > latestNewReferral.itemDate &&
                eventStatus === false &&
                (timelineItemType === "CONTACT" ||
                  timelineItemType === "TEACHING")
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
