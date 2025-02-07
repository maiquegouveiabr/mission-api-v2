import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "@/util/db";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { id: referralId } = req.query;
    if (!referralId) {
      res.status(400).json({
        at: "referralExist",
        message: "REFERRAL_ID NOT FOUND",
      });
    } else {
      const referral = await prisma.reference.findUnique({
        where: {
          id: String(referralId),
        },
      });
      if (referral) {
        res.status(200).send(true);
      } else {
        res.status(200).send(false);
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(null);
  }
};
