import { useState, useEffect } from "react";

export function useIds() {
  const [ids, setIds] = useState<string[]>([]);

  const fetchIds = async () => {
    const API_URL = process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://mission-api-v2.vercel.app";
    try {
      const response = await fetch(`${API_URL}/api/db/ids`);
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const ids = await response.json();
      setIds(ids);
      return ids;
    } catch (error) {
      console.error(error);
      setIds([]);
      return [];
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchIds();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  return { fetchIds, ids, setIds };
}
