import { NextApiRequest, NextApiResponse } from "next";
import fetchMissionArea from "@/util/api/fetchMissionAreas";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { refreshToken } = req.query;
  const zones = await fetchMissionArea(String(refreshToken));

  try {
    if (zones.length < 0) {
      res.status(400).send({
        statusMessage: "There was an error!",
      });
    } else {
      const data = zones.flatMap((zone) =>
        zone.areas.map((area) => {
          return {
            id: area.id,
            name: area.name,
            zone_id: zone.zone.id,
          };
        })
      );

      res.status(200).json(data);
    }
  } catch (error) {
    res.status(500).send(`${error}`);
  }
};
