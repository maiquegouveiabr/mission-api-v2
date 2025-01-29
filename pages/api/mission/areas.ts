import { NextApiRequest, NextApiResponse } from "next";
import { promises as fs } from "fs";
import { join } from "path";
import fetchMissionArea from "@/util/api/fetchMissionAreas";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req: NextApiRequest, res: NextApiResponse) => {
  const missionAreas = await fetchMissionArea();
  const successFilePath = join(process.cwd(), "public/html/areas.html");

  try {
    if (missionAreas.length < 0) {
      res.status(400).send({
        statusMessage: "There was an error!",
      });
    } else {
      let successHTML = await fs.readFile(successFilePath, "utf-8");
      const missionAreasHTML = missionAreas
        .map(
          (area) =>
            `<li class="areaItem">
                  <p>${area.id}</p>
                  <p>${area.name}</p>
                  <p>${area.areaNumbers}</p>
                  <p>${area.address}</p>
                  <p>${area.email}</p>
                  <ul>
                    ${area.missionaries.map((missionarie) => {
                      return `
                      <li>
                          <p>${missionarie.firstName} ${missionarie.lastName}</p>
                          <p>${missionarie.emailAddress}</p>
                          <p>${missionarie.missionaryType}</p>
                      </li>
                      `;
                    })}
                  </ul>
              </li>`
        )
        .join("");
      successHTML = successHTML.replace("{{MISSION_AREAS}}", missionAreasHTML);
      res.status(200).setHeader("Content-Type", "text/html").send(successHTML);
    }
  } catch (error) {
    res.status(500).send(`${error}`);
  }
};
