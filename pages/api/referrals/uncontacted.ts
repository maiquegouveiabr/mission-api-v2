import { ContactAttempt, Referral } from "@/interfaces";
import fetchData from "@/util/api/fetchData";
import filterUncontactedReferrals from "@/util/filterUncontactedReferrals";
import organizeEvents from "@/util/organizeEvents";
import { NextApiRequest, NextApiResponse } from "next";

const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";

const processReferralsWithAttempts = async (referrals: Referral[], refreshToken: string) => {
  return Promise.all(
    referrals.map(async (ref) => {
      let contactAttempts: ContactAttempt[] = await fetchData(
        `https://referralmanager.churchofjesuschrist.org/services/progress/timeline/${ref.personGuid}`,
        refreshToken
      );
      let latestNewReferral = contactAttempts.find(({ timelineItemType }) => timelineItemType === "NEW_REFERRAL");
      if (!latestNewReferral) return;
      let filteredAttempts = organizeEvents(
        contactAttempts.filter(
          ({ itemDate, eventStatus, timelineItemType }) =>
            itemDate > latestNewReferral.itemDate &&
            eventStatus === false &&
            (timelineItemType === "CONTACT" || timelineItemType === "TEACHING")
        ) || []
      );
      return {
        ...ref,
        contactAttempts: filteredAttempts,
        referralTimestamp: latestNewReferral.itemDate,
      };
    })
  );
};

export default async function Uncontacted(req: NextApiRequest, res: NextApiResponse) {
  const { refreshToken } = req.query;
  if (!refreshToken) {
    res.status(400).json({
      at: "api/referrals/uncontacted",
      message: "refreshToken was not provided",
    });
  } else {
    const response = await fetch(`${API_URL}/api/mission/areas?refreshToken=${refreshToken}`);
    const areasData = await response.json();
    const data = await fetchData("https://referralmanager.churchofjesuschrist.org/services/people/mission/14319", String(refreshToken));
    if (!data) {
      res.status(500).json({
        at: "api/referrals/uncontacted.ts",
        func: "fetchData",
        message: "INTERNAL_SERVER_ERROR",
      });
    } else {
      const referrals = await processReferralsWithAttempts(filterUncontactedReferrals(data.persons, areasData), String(refreshToken));
      res.status(200).send(referrals);
    }
  }
}
