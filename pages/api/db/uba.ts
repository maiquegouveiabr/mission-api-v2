import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/util/db";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const uba = await prisma.uba_area.findMany({ orderBy: { name: "asc" } });
    res.status(200).send(uba);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
