import { AreaInfo, Referral } from "@/interfaces";
import fetchData from "./fetchData";

// eslint-disable-next-line import/no-anonymous-default-export
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
