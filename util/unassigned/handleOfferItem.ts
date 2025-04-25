import { Referral } from "@/interfaces";

export default async function func(
  refreshToken: string,
  filteredRefs: Referral[],
  ref: Referral,
  refs: Referral[],
  offerRef: string,
  setFilteredRefs: React.Dispatch<React.SetStateAction<Referral[]>>,
  setRefs: React.Dispatch<React.SetStateAction<Referral[]>>,
  setOfferRef: React.Dispatch<React.SetStateAction<string>>
) {
  if (!ref.personOffer && !ref.offerItem) {
    try {
      const response = await fetch(`/api/referrals/offer?id=${ref.personGuid}&refreshToken=${refreshToken}`);

      if (!response.ok) {
        const { error, message } = await response.json();
        alert(message);
        return;
      } else {
        const { offerItem, personOffer } = await response.json();
        const newRef = {
          ...ref,
          offerItem,
          personOffer,
        };
        const copyUnassigned = [...refs];
        const copyFiltered = [...filteredRefs];

        const index = copyUnassigned.findIndex((r) => r.personGuid === ref.personGuid);
        if (index !== -1) {
          copyUnassigned[index] = newRef;
        }
        const indexFiltered = copyFiltered.findIndex((r) => r.personGuid === ref.personGuid);
        if (indexFiltered !== -1) {
          copyFiltered[indexFiltered] = newRef;
        }

        setFilteredRefs(copyFiltered);
        setRefs(copyUnassigned);
        setOfferRef(ref.personGuid);
      }
    } catch (error) {}
  } else {
    setOfferRef(offerRef === ref.personGuid ? "" : ref.personGuid);
  }
}
