import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/util/db";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const { zone } = req.query;
    if (zone) {
      const referrals = await prisma.referral.findMany({
        include: {
          zone: {
            select: {
              name: true,
              zone_id: true,
            },
          },
        },
        where: {
          zone: {
            name: {
              equals: String(zone),
            },
          },
        },
      });
      if (referrals.length > 0) {
        res.send(referrals);
      } else {
        res.send("No results.");
      }
    }
    const referrals = await prisma.referral.findMany();
    if (referrals.length > 0) {
      res.send(referrals);
    } else {
      res.send("No results.");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("INTERNAL SERVER ERROR 500");
  }
};
