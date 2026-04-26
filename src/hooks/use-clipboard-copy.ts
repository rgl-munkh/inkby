"use client";

import { useState, useCallback } from "react";

const COPY_FEEDBACK_MS = 2000;

export function useClipboardCopy(timeout = COPY_FEEDBACK_MS) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(
    (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), timeout);
    },
    [timeout]
  );

  return { copied, copy };
}
