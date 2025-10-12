import { useState } from "react";
import { api } from "@/lib/api";

export default function FeedbackBar({ answerId }:{ answerId:string }) {
  const [sent, setSent] = useState(false);
  const send = async (rating:"up"|"down", tag?:string) => {
    if (sent) return;
    try { await api.feedback({ answerId, rating, tag }); setSent(true); }
    catch { /* TODO: surface toast */ }
  };
  return (
    <div className="flex items-center gap-3 text-sm opacity-90 mt-2">
      <button className="px-2 py-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-700"
              onClick={()=>send("up")}>👍 Helpful</button>
      <button className="px-2 py-1 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-700"
              onClick={()=>send("down")}>👎 Needs work</button>
      {sent && <span className="text-xs opacity-70">Thanks!</span>}
    </div>
  );
}
