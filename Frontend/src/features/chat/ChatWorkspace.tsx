import { useParams } from "react-router-dom";
import { useState } from "react";
import { useChatSocket } from "./useChatSocket";
export default function ChatWorkspace() {
  const { id = "new" } = useParams();
  const { stream, send, ready } = useChatSocket(id);
  const [input, setInput] = useState("");
  const canSend = ready && input.trim().length > 0;
  return (
    <div className="h-full grid grid-rows-[1fr_auto]">
      <div className="p-6 overflow-auto whitespace-pre-wrap">{stream || "Ask Nexus…"}</div>
      <form className="p-4 border-t flex gap-2" onSubmit={(e)=>{e.preventDefault(); if(canSend) { send(input); setInput(""); }}}>
        <input className="input flex-1" value={input} onChange={(e)=>setInput(e.target.value)} placeholder="Ask Nexus…" />
        <button className="btn" disabled={!canSend}>Send</button>
      </form>
    </div>
  );
}
