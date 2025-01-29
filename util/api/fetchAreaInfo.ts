import { ReferralComplete, AreaInfo } from "@/interfaces";
import fetchData from "./fetchData";

// eslint-disable-next-line import/no-anonymous-default-export
export default async (referrals: ReferralComplete[]) => {
  return Promise.all(
    referrals.map(async (ref) => {
      const areaInfo: AreaInfo = await fetchData(
        `https://referralmanager.churchofjesuschrist.org/services/mission/assignment?address=${ref.person.householdInfo.address}`
      );
      return {
        ...ref,
        areaInfo: areaInfo,
      };
    })
  );
};
