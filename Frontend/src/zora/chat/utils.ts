import { ChatMessage } from "@/features/chat/context/ChatContext";

export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat("en", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));

export const formatPreview = (messages: ChatMessage[]) => {
  const firstUser = messages.find(
    (msg) => msg.role === "user" && msg.content?.length,
  );
  return firstUser
    ? firstUser.content.split("\n")[0].slice(0, 80)
    : "No user messages yet.";
};
