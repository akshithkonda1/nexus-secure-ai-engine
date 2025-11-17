export async function sendFeedback(
  messageId: string,
  direction: "up" | "down",
): Promise<void> {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ messageId, direction }),
  });

  if (!res.ok) {
    throw new Error("Feedback request failed");
  }
}
