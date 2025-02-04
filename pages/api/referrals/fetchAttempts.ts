import { ContactAttempt, Referral } from "@/interfaces";
import fetchData from "@/util/api/fetchData";
import filterUniqueEvent from "@/util/filterUniqueEvent";
import { NextApiRequest, NextApiResponse } from "next";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const unassigned: Referral[] = req.body;
  const { refreshToken } = req.query;
  const referralsComplete = await Promise.all(
    unassigned.map(async (ref) => {
      const contactAttempts: ContactAttempt[] = await fetchData(
        `https://referralmanager.churchofjesuschrist.org/services/progress/timeline/${ref.personGuid}`,
        String(refreshToken)
      );
      const latestNewReferral = contactAttempts.find(({ timelineItemType }) => timelineItemType === "NEW_REFERRAL") || null;

      if (latestNewReferral) {
        const filteredAttempts = filterUniqueEvent(
          contactAttempts.filter(
            ({ itemDate, timelineItemType }) =>
              itemDate > latestNewReferral.itemDate && (timelineItemType === "CONTACT" || timelineItemType === "TEACHING")
          ) || []
        );
        return {
          ...ref,
          contactAttempts: filteredAttempts,
          referralTimestamp: latestNewReferral.itemDate,
        };
      }
      return ref;
    })
  );
  if (referralsComplete) {
    res.status(200).json(referralsComplete);
  } else {
    res.status(500).json([]);
  }
};
