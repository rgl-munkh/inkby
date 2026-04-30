"use client";

import { useState, useRef } from "react";
import type { Artist, FlashDeal } from "../types";
import { mapTattooSizeToApi } from "../lib/map-tattoo-size";
import {
  createBookingRequest,
  uploadReferencePhoto,
} from "../services/booking-flow-service";

export function useProfileBookingFlow({
  artist,
  initialFlashDeals,
}: {
  artist: Artist;
  initialFlashDeals: FlashDeal[];
}) {
  const slug = artist.slug;

  const [step, setStep] = useState(0);
  const [bookingRequestId, setBookingRequestId] = useState<string | null>(null);
  const [showAvailability, setShowAvailability] = useState(false);
  const [chosenDatetime, setChosenDatetime] = useState<string | null>(null);
  const [flashDeals] = useState<FlashDeal[]>(initialFlashDeals);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const [idea, setIdea] = useState("");
  const [selectedFlashPhotoUrl, setSelectedFlashPhotoUrl] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [size, setSize] = useState("");
  const [placement, setPlacement] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayName = artist?.displayName ?? artist?.instagramUsername ?? slug;

  async function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setPhotoFiles((prev) => [...prev, ...files]);
  }

  function removePhoto(index: number) {
    setPhotoFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function uploadPhotos(): Promise<string[]> {
    const urls: string[] = [];
    for (const file of photoFiles) {
      const url = await uploadReferencePhoto(file);
      if (url) urls.push(url);
    }
    return urls;
  }

  function validatePersonalStep() {
    if (!firstName.trim()) { setError("First name is required"); return false; }
    if (!lastName.trim()) { setError("Last name is required"); return false; }
    if (!phone.trim()) { setError("Phone number is required"); return false; }
    if (!email.trim()) { setError("Email is required"); return false; }
    return true;
  }

  function validateTattooStep() {
    if (!idea.trim()) { setError("Please describe your tattoo idea"); return false; }
    if (!size) { setError("Please select a tattoo size"); return false; }
    if (!placement) { setError("Please select a placement"); return false; }
    return true;
  }

  async function handleSubmit() {
    if (!artist) return;
    if (!validatePersonalStep()) return;
    if (!validateTattooStep()) return;

    setError("");
    setSubmitting(true);

    try {
      const uploadedUrls = await uploadPhotos();
      setPhotoUrls(uploadedUrls);
      const photo_urls = selectedFlashPhotoUrl
        ? [selectedFlashPhotoUrl, ...uploadedUrls]
        : uploadedUrls;

      const result = await createBookingRequest({
        artist_id: artist.id,
        first_name: firstName,
        last_name: lastName,
        phone,
        email,
        idea_description: idea,
        tattoo_size: mapTattooSizeToApi(size),
        placement: placement.toLowerCase(),
        photo_urls,
      });
      if (result.error) {
        setError(result.error);
        return;
      }

      setStep(3);
      setBookingRequestId(result.bookingRequestId);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function continueFromTattooStep() {
    if (validateTattooStep()) {
      setError("");
      setStep(2);
    }
  }

  function resetAfterSuccess() {
    setStep(0);
    setFirstName(""); setLastName(""); setPhone(""); setEmail("");
    setIdea(""); setPhotoFiles([]); setPhotoUrls([]);
    setSize(""); setPlacement(""); setError("");
  }

  function pickFlashDeal(deal: FlashDeal) {
    setIdea(`I'm interested in your flash: ${deal.title ?? "Untitled"}`);
    setSelectedFlashPhotoUrl(deal.photoUrl);
    setStep(1);
  }

  return {
    artist,
    flashDeals,
    displayName,
    slug,
    step,
    setStep,
    bookingRequestId,
    showAvailability,
    setShowAvailability,
    chosenDatetime,
    setChosenDatetime,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    phone,
    setPhone,
    email,
    setEmail,
    idea,
    setIdea,
    selectedFlashPhotoUrl,
    setSelectedFlashPhotoUrl,
    photoFiles,
    photoUrls,
    size,
    setSize,
    placement,
    setPlacement,
    submitting,
    error,
    setError,
    fileInputRef,
    handlePhotoChange,
    removePhoto,
    handleSubmit,
    validateTattooStep,
    continueFromTattooStep,
    resetAfterSuccess,
    pickFlashDeal,
  };
}
