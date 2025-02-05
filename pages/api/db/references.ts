import { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/util/db";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const data = JSON.parse(req.body);
  if (!data) {
    res.status(400).json({
      at: "api/db/references",
      message: "no data provided.",
    });
  } else {
    const response = await prisma.reference.create({
      data,
    });
    if (response) {
      res.status(200).send(response);
    } else {
      res.status(500).json({
        at: "api/db/references",
        message: "server side error",
      });
    }
  }
};
