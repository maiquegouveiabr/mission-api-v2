import { ContactAttempt, Referral } from "@/interfaces";
import fetchData from "@/util/api/fetchData";
import filterUniqueEvent from "@/util/filterUniqueEvent";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { refreshToken } = req.query;
  if (!refreshToken) {
    res.status(400).json({
      at: "referralAttemptApi",
      message: "Refresh Token missing!",
    });
  } else {
    const referrals: Referral[] = JSON.parse(req.body);

    const response = await Promise.all(
      referrals.map(async (ref) => {
        const contactAttempts: ContactAttempt[] = await fetchData(
          `https://referralmanager.churchofjesuschrist.org/services/progress/timeline/${ref.personGuid}`,
          String(refreshToken)
        );
        if (contactAttempts) {
          const filteredAttempts = filterUniqueEvent(
            contactAttempts.filter(({ timelineItemType }) => timelineItemType === "CONTACT" || timelineItemType === "TEACHING") || []
          );
          return {
            ...ref,
            contactAttempts: filteredAttempts,
          };
        }
        return {
          ...ref,
          contactAttempts: [],
        };
      })
    );
    res.send(response);
  }
};
