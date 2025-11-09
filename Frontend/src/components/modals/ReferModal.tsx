import { useModal } from "@/state/useModal";

export function ReferModal() {
  const { openKey, close } = useModal();
  const open = openKey === "refer";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40">
      <div className="w-full max-w-md rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-2xl">
        <h3 className="text-xl font-semibold">Refer Nexus</h3>
        <p className="mt-1 text-[color:rgba(var(--text)/.75)]">
          Referral program is in the works. Soon you’ll be able to invite friends and earn credits.
        </p>
        <div className="mt-4 flex justify-end">
          <button onClick={close} className="rounded-xl border border-[color:rgba(var(--border))] px-4 py-2">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
