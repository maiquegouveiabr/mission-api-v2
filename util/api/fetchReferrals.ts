import fetchData from "./fetchData";
import { Referral } from "@/interfaces";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (refreshToken: string): Promise<Referral[] | []> => {
  const data = await fetchData(
    "https://referralmanager.churchofjesuschrist.org/services/people/mission/14319",
    refreshToken
  );
  if (!data) return [];
  return data.persons;
};
