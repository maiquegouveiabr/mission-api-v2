import fetchData from "./fetchData";
import { ReferralComplete } from "@/interfaces";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (urls: string[]): Promise<ReferralComplete[] | []> => {
  const data = await Promise.all(urls.map((url) => fetchData(url)));
  if (!data) return [];
  return data;
};
