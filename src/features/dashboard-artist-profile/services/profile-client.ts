export async function uploadAvatar(file: File): Promise<{
  url: string | null;
  error: string | null;
}> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("bucket", "avatars");

  const res = await fetch("/api/upload", { method: "POST", body: formData });
  const data = await res.json();

  if (!res.ok) {
    return { url: null, error: data.error ?? "Upload failed" };
  }

  return { url: data.url, error: null };
}

export async function saveAvatarUrl(avatarUrl: string): Promise<{
  error: string | null;
}> {
  const res = await fetch("/api/artist/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ avatar_url: avatarUrl }),
  });
  const data = await res.json();

  if (!res.ok) {
    return { error: data.error ?? "Could not save photo" };
  }

  return { error: null };
}
