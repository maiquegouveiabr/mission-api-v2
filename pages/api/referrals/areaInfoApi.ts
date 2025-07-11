import fetchAreaInfo from "@/util/api/fetchAreaInfo";
import { NextApiRequest, NextApiResponse } from "next";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { refreshToken } = req.query;
  if (!refreshToken) {
    res.status(400).json({
      at: "areaInfoApi",
      message: "Refresh Token missing!",
    });
  } else {
    const referrals = req.body;
    const referralsWithArea = await fetchAreaInfo(referrals, String(refreshToken));
    res.send(referralsWithArea);
  }
};
