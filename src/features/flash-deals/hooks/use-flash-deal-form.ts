"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildFlashDealPayload,
  defaultFlashDealRows,
  rowsFromFlashDeal,
} from "../lib/flash-deal-form";
import { saveFlashDeal, uploadFlashDealPhoto } from "../services/flash-deals-client";
import type { FlashDealSheetDeal, FlashDealSizeRowState } from "../types";

export function useFlashDealForm({
  open,
  deal,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  deal?: FlashDealSheetDeal | null;
  onOpenChange: (value: boolean) => void;
  onCreated: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isRepeatable, setIsRepeatable] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [rows, setRows] = useState<FlashDealSizeRowState[]>(() =>
    defaultFlashDealRows(),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = Boolean(deal);

  useEffect(() => {
    if (!open) return;
    if (deal) {
      setPhotoUrl(deal.photoUrl);
      setTitle(deal.title ?? "");
      setDescription(deal.description ?? "");
      setIsRepeatable(deal.isRepeatable);
      setIsActive(deal.isActive);
      setRows(rowsFromFlashDeal(deal));
      setError("");
      return;
    }
    setPhotoUrl("");
    setTitle("");
    setDescription("");
    setIsRepeatable(false);
    setIsActive(true);
    setRows(defaultFlashDealRows());
    setError("");
  }, [open, deal]);

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");
    try {
      const result = await uploadFlashDealPhoto(file);
      if (result.error) {
        setError(result.error);
        return;
      }
      setPhotoUrl(result.url ?? "");
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  }

  function setRow(index: number, patch: Partial<FlashDealSizeRowState>) {
    setRows((prev) =>
      prev.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  }

  async function handleSubmit() {
    setError("");
    const result = buildFlashDealPayload({
      photoUrl,
      title,
      description,
      isRepeatable,
      isActive,
      isEdit,
      rows,
    });

    if (!result.body) {
      setError(result.error);
      return;
    }

    const dealId = deal?.id;
    if (isEdit && !dealId) {
      setError("Something went wrong");
      return;
    }

    setSubmitting(true);
    try {
      const response = await saveFlashDeal({ dealId, body: result.body });
      if (response.error) {
        setError(response.error);
        return;
      }
      onOpenChange(false);
      onCreated();
    } catch {
      setError("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  return {
    cameraRef,
    description,
    error,
    fileRef,
    handleSubmit,
    isActive,
    isEdit,
    isRepeatable,
    photoUrl,
    rows,
    setDescription,
    setIsActive,
    setIsRepeatable,
    setRow,
    setTitle,
    submitting,
    title,
    uploadFile,
    uploading,
  };
}
