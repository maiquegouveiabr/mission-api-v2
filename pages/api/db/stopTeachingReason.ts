import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/util/db";

export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const reasons = await prisma.stop_teaching_reason.findMany({ orderBy: { name: "asc" } });
    res.status(200).send(reasons);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error });
  }
}
