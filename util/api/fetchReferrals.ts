import fetchData from "./fetchData";
import { Referral } from "@/interfaces";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (refreshToken: string): Promise<Referral[] | []> => {
  const missionId = process.env.NEXT_PUBLIC_MISSION_ID;
  const url = `https://referralmanager.churchofjesuschrist.org/services/people/mission/${missionId}`;
  const data = await fetchData(url, refreshToken);
  if (!data) return [];
  return data.persons;
};
