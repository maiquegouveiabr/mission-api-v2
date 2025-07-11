import { AreaInfo, Referral } from "@/interfaces";
import fetchData from "./fetchData";

export default async (referrals: string, refreshToken: string) => {
  const parsedReferrals: Referral[] = JSON.parse(referrals);
  return Promise.all(
    parsedReferrals.map(async (ref) => {
      const areaInfo: AreaInfo = await fetchData(
        `https://referralmanager.churchofjesuschrist.org/services/mission/assignment?address=${ref.address}`,
        refreshToken
      );
      return {
        ...ref,
        areaInfo: areaInfo,
      };
    })
  );
};
