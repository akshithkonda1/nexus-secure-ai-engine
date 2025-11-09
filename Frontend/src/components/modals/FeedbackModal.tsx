import { useModal } from "@/state/useModal";

export function FeedbackModal(){
  const { openKey, close } = useModal();
  if (openKey !== "feedback") return null;
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40">
      <div className="w-full max-w-xl rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-2xl">
        <h3 className="text-xl font-semibold">User Feedback</h3>
        <textarea className="mt-3 w-full h-48 rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3"
          placeholder="Tell us everything (20,000 characters)…" />
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={close} className="rounded-xl border border-[color:rgba(var(--border))] px-4 py-2">Close</button>
          <button className="rounded-xl bg-[color:var(--brand)] px-4 py-2 text-white">Submit</button>
        </div>
      </div>
    </div>
  );
}
