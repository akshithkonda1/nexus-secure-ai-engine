import React from "react";
import ChatView from "./features/convos/ChatView";
import { ThemeStyles } from "./components/ThemeStyles";

export default function App() {
  return (
    <>
      <ThemeStyles />
      <ChatView />
    </>
  );
}
