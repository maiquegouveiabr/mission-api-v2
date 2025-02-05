import fetchData from "./fetchData";
import { District, ProsArea, Zone } from "@/interfaces";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (refreshToken: string): Promise<{ zone: Zone; areas: ProsArea[] }[]> => {
  const data = await fetchData("https://referralmanager.churchofjesuschrist.org/services/mission/14319", refreshToken);
  if (!data) return [];

  const zonesArr = data.mission.children || [];
  return zonesArr.map((zone: Zone) => ({
    zone: { name: zone.name, id: zone.id },
    areas: zone.children.flatMap((district: District) => district.children),
  }));
};
