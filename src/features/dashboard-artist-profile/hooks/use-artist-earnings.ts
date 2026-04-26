"use client";

import { useState, useEffect } from "react";
import type { Period } from "../types";

export function useArtistEarnings(activePeriod: Period) {
  const [earnings, setEarnings] = useState<number | null>(null);
  const [earningsLoading, setEarningsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function loadEarnings() {
      setEarningsLoading(true);
      try {
        const r = await fetch(`/api/artist/earnings?period=${activePeriod.toLowerCase()}`);
        const data = await r.json();
        if (!cancelled) setEarnings(data.total ?? 0);
      } catch {
        if (!cancelled) setEarnings(0);
      } finally {
        if (!cancelled) setEarningsLoading(false);
      }
    }
    loadEarnings();
    return () => { cancelled = true; };
  }, [activePeriod]);

  return { earnings, earningsLoading };
}
