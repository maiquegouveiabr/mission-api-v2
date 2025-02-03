import { OfferItem, PersonOffer, Referral } from "@/interfaces";
import fetchData from "@/util/api/fetchData";
import { NextApiRequest, NextApiResponse } from "next";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { refreshToken } = req.query;
    const referral: Referral = JSON.parse(req.body);

    if (!refreshToken) {
      res.status(400).json({
        at: "offerItemApi",
        message: "refreshToken was not found.",
      });
    } else {
      const personOffer: PersonOffer[] = await fetchData(
        `https://referralmanager.churchofjesuschrist.org/services/offers/person-offers/${referral.personGuid}`,
        String(refreshToken)
      );
      const url = `https://referralmanager.churchofjesuschrist.org/services/campaign/${personOffer[0].boncomCampaignId}`;
      const data: OfferItem[] = await fetchData(url, String(refreshToken));
      res.status(200).json({
        ...referral,
        offerItem: data[0],
        personOffer: personOffer[0],
      });
    }
  } catch (error) {
    console.error(error);
  }
};
