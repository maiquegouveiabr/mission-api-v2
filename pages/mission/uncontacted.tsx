import Title from "@/components/Title";
import { Referral } from "@/interfaces";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Uncontacted() {
  const [referrals, setReferrals] = useState<Referral[] | null>(null);
  const [filtered, setFiltered] = useState<Referral[] | null>(null);
  const searchParams = useSearchParams();

  async function fetchReferrals(refreshToken: string) {
    const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
    const response = await fetch(`${API_URL}/api/referrals/uncontacted?refreshToken=${refreshToken}`);
    const referrals: Referral[] = await response.json();
    setReferrals(referrals);
    setFiltered(referrals);
  }

  useEffect(() => {
    const refreshToken = searchParams?.get("refreshToken");
    if (refreshToken) fetchReferrals(refreshToken);
  }, [searchParams]);

  return (
    <div>
      <Title title={`Uncontacted, (${filtered ? filtered.length : 0})`} />
    </div>
  );
}
