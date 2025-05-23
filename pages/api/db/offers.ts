import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/util/db";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const offers = await prisma.offer.findMany({ orderBy: { name: "asc" } });
    res.status(200).send(offers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
