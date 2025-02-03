import { Referral } from "@/interfaces";
import fetchReferralsInfo from "@/util/api/fetchReferralsInfo";
import { NextApiRequest, NextApiResponse } from "next";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { refreshToken } = req.query;
  const referral: Referral = JSON.parse(req.body);
  if (!refreshToken) {
    res.status(400).json({
      at: "referralInfoApi",
      message: "refreshToken was not provided.",
    });
  } else {
    const referralInfo = await fetchReferralsInfo(
      [`https://referralmanager.churchofjesuschrist.org/services/people/${referral.personGuid}`],
      String(refreshToken)
    );
    if (referralInfo[0]) {
      const contactAttempts = referral.contactAttempts;
      const areaInfo = referral.areaInfo;
      const address = referral.address;
      const personGuid = referral.personGuid;
      const offerItem = referral.offerItem;
      const personOffer = referral.personOffer;
      res.send({
        ...referralInfo[0].person,
        contactAttempts,
        areaInfo,
        address,
        personGuid,
        offerItem,
        personOffer,
      });
    } else {
      res.send(referral);
    }
  }
};
