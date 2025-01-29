import { NextApiRequest, NextApiResponse } from "next";

import fetchReferrals from "@/util/api/fetchReferrals";
import fetchReferralsInfo from "@/util/api/fetchReferralsInfo";

import fetchAttempts from "@/util/api/fetchAttempts";
import fetchAreaInfo from "@/util/api/fetchAreaInfo";
import sleep from "@/util/sleep";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const referrals = await fetchReferrals();
  if (!(referrals.length > 0)) {
    return res.status(404).json({
      at: "fetchReferrals",
      message: "No data found",
    });
  } else {
    const unassignedReferrals = referrals.filter(
      (ref) => !ref.areaId && ref.personStatusId === 1
    );
    const referralsComplete = await fetchReferralsInfo(
      unassignedReferrals.map(
        (ref) =>
          `https://referralmanager.churchofjesuschrist.org/services/people/${ref.personGuid}`
      )
    );
    if (!(referralsComplete.length > 0)) {
      return res.status(404).json({
        at: "fetchReferralsInfo",
        message: "No data found",
      });
    } else {
      await sleep(3000);
      const referralsCompleteWithArea = await fetchAreaInfo(referralsComplete);
      const referralsAttempt = await fetchAttempts(referralsCompleteWithArea);
      referralsAttempt.sort(
        (a, b) =>
          new Date(b.person.createDate).getTime() -
          new Date(a.person.createDate).getTime()
      );
      res.status(200).send(referralsAttempt);
    }
  }
};
