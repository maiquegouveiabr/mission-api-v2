import { Referral } from "@/interfaces";
import { useState, useEffect } from "react";

export default function useReferrals(refreshToken: string) {
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [filteredReferrals, setFilteredReferrals] = useState<Referral[]>([]);
  const [loadingReferrals, setLoadingReferrals] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchReferrals = async () => {
    setLoadingReferrals(true);
    setError(null); // Reset errors before fetching
    try {
      const isDev = process.env.NODE_ENV === "development";
      const url = isDev ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
      const response = await fetch(`${url}/api/referrals/unassigned?refreshToken=${refreshToken}`);

      if (!response.ok) {
        throw new Error("Failed to fetch areas");
      }

      const data: Referral[] = await response.json();
      setReferrals(
        data.map((ref) => {
          return {
            ...ref,
            sentStatus: false,
          };
        })
      );
      setFilteredReferrals(
        data.map((ref) => {
          return {
            ...ref,
            sentStatus: false,
          };
        })
      );
      setLoadingReferrals(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  };

  useEffect(() => {
    fetchReferrals();
  }, []);

  return { referrals, setReferrals, filteredReferrals, setFilteredReferrals, loadingReferrals, error, fetchReferrals };
}
