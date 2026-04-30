import type { SaveFlashDealBody } from "../types";

export async function uploadFlashDealPhoto(file: File): Promise<{
  url: string | null;
  error: string | null;
}> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", "flash-deal-photos");

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    return { url: null, error: data.error ?? "Upload failed" };
  }

  return { url: data.url, error: null };
}

export async function saveFlashDeal({
  dealId,
  body,
}: {
  dealId?: string;
  body: SaveFlashDealBody;
}): Promise<{ error: string | null }> {
  const isEdit = Boolean(dealId);
  const res = await fetch(isEdit ? `/api/flash-deals/${dealId}` : "/api/flash-deals", {
    method: isEdit ? "PATCH" : "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();

  if (!res.ok) {
    return {
      error: data.error ?? (isEdit ? "Could not update flash" : "Could not create flash"),
    };
  }

  return { error: null };
}
