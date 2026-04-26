"use client";

import { useState, useEffect } from "react";
import type { Artist } from "../types";

export function useArtistProfile() {
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/artist/profile")
      .then((r) => r.json())
      .then((data) => setArtist(data.artist ?? null))
      .catch(() => setArtist(null))
      .finally(() => setLoading(false));
  }, []);

  return { artist, loading };
}
