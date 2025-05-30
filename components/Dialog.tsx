import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Select from "@/components/Select";
import { Area, Offer, Referral, StopTeachingReason, UbaArea, User } from "@/interfaces";
import { useEffect, useMemo, useState } from "react";

const specialAreaLabels: Record<number, string> = {
  0: "UBA Area",
  1: "Mission Name",
  2: "Reason To Stop Teaching",
};

type Props = {
  offers: Offer[];
  users: User[];
  areas: Area[];
  uba: UbaArea[];
  reasons: StopTeachingReason[];
  ref: Referral | null;
  setOpen: (open: boolean) => void;
  open: boolean;
  postSent: (ref: Referral, offer: string, areaId: number) => void;
};

export default ({ users, areas, offers, uba, reasons, ref, open, setOpen, postSent }: Props) => {
  if (!ref) return null;

  const [ubaId, setUbaId] = useState<number | null>(null);
  const [areaId, setAreaId] = useState<number | null>(null);
  const [userId, setUserId] = useState<number | null>(null);
  const [offerId, setOfferId] = useState<number | null>(null);
  const [reasonId, setReasonId] = useState<number | null>(null);
  const [offer, setOffer] = useState("");
  const [other, setOther] = useState("");
  const [sending, setSending] = useState(false);
  const [disabledOffer, setDisabledOffer] = useState(true);
  const [disabledReason, setDisabledReason] = useState(true);

  const memoizedUsers = useMemo(() => {
    return users.map((user) => ({
      id: user.user_id,
      name: user.name,
    }));
  }, [users]);

  const memoizedAreas = useMemo(() => {
    return areas.map((area) => ({
      id: area.id,
      name: area.name,
    }));
  }, [areas]);

  const memoizedUba = useMemo(() => {
    return uba.map((uba) => ({
      id: uba.id,
      name: uba.name,
    }));
  }, [uba]);

  const memoizedOffers = useMemo(() => {
    return offers.map((offer) => ({
      id: offer.id,
      name: offer.name,
    }));
  }, [offers]);

  const memoizedReasons = useMemo(() => {
    return reasons.map((reason) => {
      return {
        id: reason.id,
        name: reason.name,
      };
    });
  }, [reasons]);

  const handleAreaChange = (id: number) => {
    setAreaId(id);
  };

  const handleUbaAreaChange = (id: number) => {
    setUbaId(id);
    const selectedUba = uba.find((item) => item.id === id);
    if (selectedUba) {
      setOther(selectedUba.name);
    }
  };

  const handleUserChange = (id: number) => {
    setUserId(id);
  };

  const handleOfferChange = (id: number) => {
    setOfferId(id);
  };

  const handleReasonChange = (id: number) => {
    setReasonId(id);
  };

  const handleSend = async () => {
    try {
      let frOffer = offer.trim();
      let frOther = other.trim();

      const offerItem = offers.find((item) => item.id === offerId);
      const reasonItem = reasons.find((item) => item.id === reasonId);
      if (!offerItem) return;

      if (offerItem.id !== 1) frOffer = offerItem.name;
      if (reasonItem && reasonItem.id !== 1) frOther = reasonItem.name;

      if (areaId == null || userId == null || !frOffer) {
        alert("Please, don't forget any fields!");
        return;
      }

      if ((areaId === 0 || areaId === 1 || areaId === 2) && !frOther) {
        alert("Please, don't forget any fields!");
        return;
      }

      const user = users.find((user) => user.user_id === userId);
      if (user) {
        setSending(true);
        const data = {
          id: ref.personGuid,
          name: ref.firstName,
          who_sent: user.name,
          offer: frOffer,
          phone: ref.contactInfo?.phoneNumbers?.[0]?.number || "",
          area_id: areaId,
          other: frOther,
        };
        const response = await fetch("/api/db/references", {
          method: "POST",
          body: JSON.stringify(data),
        });
        if (!response.ok) {
          if (response.status === 409) {
            throw new Error("This referral was sent by someone else!");
          } else if (response.status === 500) {
            throw new Error("INTERNAL_SERVER_ERROR");
          }
        }
        setOpen(false);
        setSending(false);
        postSent(ref, frOffer.toUpperCase(), areaId);
      } else {
        throw new Error("An unexpected error occurred.");
      }
    } catch (error) {
      alert(error);
      setOpen(false);
      setSending(false);
      console.error(error);
    }
  };

  useEffect(() => {
    setDisabledOffer(offerId === 1 ? false : true);
  }, [offerId]);

  useEffect(() => {
    setDisabledReason(reasonId === 1 ? false : true);
  }, [reasonId]);

  useEffect(() => {
    if (ref.areaInfo && ref.areaInfo.bestProsAreaId) {
      if (ref.areaInfo.missions && ref.areaInfo.missions[0].id !== 14319) {
        setAreaId(1);
        setOther(ref.areaInfo.missions[0].name);
      } else if (ref.areaInfo.bestProsAreaId === 500625799) setAreaId(0);
      else setAreaId(ref.areaInfo.bestProsAreaId);
    }
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="text-[#6e4d1d] font-['Poppins',Helvetica]">Save Referral</DialogTitle>
          <DialogDescription className="text-[#6e4d1d] font-['Poppins',Helvetica]">
            Fill out the form with the referral's information and hit the save button.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-left text-[#6e4d1d] font-['Poppins',Helvetica]">
              Referral Name
            </Label>
            <Input disabled value={ref?.firstName} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="offer" className="text-left text-[#6e4d1d] font-['Poppins',Helvetica]">
              Offer
            </Label>
            <div className="grid gap-2">
              <Select
                {...(offerId != null ? { defaultValue: String(offerId) } : {})}
                onChange={handleOfferChange}
                placeholder="Select Offer"
                selectLabel="Offer"
                data={memoizedOffers}
              />
              {!disabledOffer && <Input type="text" value={offer} onChange={(event) => setOffer(event.target.value)} />}
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="who" className="text-left text-[#6e4d1d] font-['Poppins',Helvetica]">
              Who Are You
            </Label>
            <Select onChange={handleUserChange} placeholder="Select Missionary" selectLabel="Missionaries" data={memoizedUsers} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="who" className="text-left text-[#6e4d1d] font-['Poppins',Helvetica]">
              Teaching Area
            </Label>
            <Select
              {...(areaId != null ? { defaultValue: String(areaId) } : {})}
              onChange={handleAreaChange}
              placeholder="Select Teaching Area"
              selectLabel="Teaching Area"
              data={memoizedAreas}
            />
          </div>
          {areaId === 1 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="other" className="text-left text-[#6e4d1d] font-['Poppins',Helvetica]">
                {specialAreaLabels[areaId]}
              </Label>
              <Input type="text" value={other} className="col-span-3" onChange={(event) => setOther(event.target.value)} />
            </div>
          )}
          {areaId === 2 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="who" className="text-left text-[#6e4d1d] font-['Poppins',Helvetica]">
                Reason To Stop Teaching
              </Label>
              <div className="grid gap-2">
                <Select
                  {...(ubaId != null ? { defaultValue: String(reasonId) } : {})}
                  onChange={handleReasonChange}
                  placeholder="Select Reason To Stop Teaching"
                  selectLabel="Reason To Stop Teaching"
                  data={memoizedReasons}
                />
                {!disabledReason && <Input type="text" value={other} onChange={(event) => setOther(event.target.value)} />}
              </div>
            </div>
          )}
          {areaId === 0 && (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="who" className="text-left text-[#6e4d1d] font-['Poppins',Helvetica]">
                UBA Area
              </Label>
              <Select
                {...(ubaId != null ? { defaultValue: String(ubaId) } : {})}
                onChange={handleUbaAreaChange}
                placeholder="Select UBA Area"
                selectLabel="UBA Area"
                data={memoizedUba}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button className="bg-[#6e4d1d] hover:bg-[#6e4d1d] font-semibold font-['Poppins',Helvetica]" disabled={sending} onClick={handleSend}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
