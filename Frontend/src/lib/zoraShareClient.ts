type ShareResponse = { url: string };

export async function getShareLink(messageId: string): Promise<ShareResponse> {
  const res = await fetch("/api/share", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId }),
  });

  if (!res.ok) {
    throw new Error("Share link creation failed");
  }

  const data = (await res.json()) as ShareResponse;
  if (!data.url) {
    throw new Error("Share link missing url");
  }

  return data;
}
