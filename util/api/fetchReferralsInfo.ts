import fetchData from "./fetchData";
import { ReferralComplete } from "@/interfaces";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (
  urls: string[],
  refreshToken: string
): Promise<ReferralComplete[] | []> => {
  const data = await Promise.all(
    urls.map((url) => fetchData(url, refreshToken))
  );
  if (!data) return [];
  return data;
};
