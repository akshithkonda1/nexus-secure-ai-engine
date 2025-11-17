"use client";

import React from "react";

import { ChatProvider } from "@/features/chat/context/ChatContext";
import { ZoraChatShell } from "@/zora/chat/ZoraChatShell";

export default function ChatPage() {
  return (
    <ChatProvider>
      <ZoraChatShell />
    </ChatProvider>
  );
}
