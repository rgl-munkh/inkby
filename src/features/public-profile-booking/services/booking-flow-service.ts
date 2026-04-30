export async function uploadReferencePhoto(file: File): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", "reference-photos");
  const res = await fetch("/api/upload", { method: "POST", body: formData });

  if (!res.ok) {
    return null;
  }

  const data = await res.json();
  return data.url;
}

export async function createBookingRequest(body: {
  artist_id: string;
  first_name: string;
  last_name: string;
  phone: string;
  email: string;
  idea_description: string;
  tattoo_size: string;
  placement: string;
  photo_urls: string[];
}): Promise<{
  bookingRequestId: string | null;
  error: string | null;
}> {
  const res = await fetch("/api/booking-requests", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok) {
    return { bookingRequestId: null, error: data.error ?? "Something went wrong" };
  }

  return { bookingRequestId: data.booking_request?.id ?? null, error: null };
}
