import { NextApiResponse, NextApiRequest } from "next";
import { prisma } from "@/util/db";

// eslint-disable-next-line import/no-anonymous-default-export
export default async function (req: NextApiRequest, res: NextApiResponse) {
  try {
    const areas = await prisma.area.findMany({
      where: {
        is_active: true,
      },
      orderBy: {
        name: "asc",
      },
    });
    res.status(200).send(areas);
  } catch (error) {
    console.error(error);
    res.status(400).send(error);
  }
}
