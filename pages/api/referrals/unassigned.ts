import { NextApiRequest, NextApiResponse } from "next";

import fetchReferrals from "@/util/api/fetchReferrals";

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { refreshToken } = req.query;
  const referrals = await fetchReferrals(String(refreshToken));
  if (!(referrals.length > 0)) {
    return res.status(404).json({
      at: "fetchReferrals",
      message: "No data found",
    });
  } else {
    const unassignedReferrals = referrals.filter((ref) => !ref.areaId && ref.personStatusId === 1);

    unassignedReferrals.sort((a, b) => new Date(b.createDate).getTime() - new Date(a.createDate).getTime());

    res.status(200).send(unassignedReferrals);
  }
};
