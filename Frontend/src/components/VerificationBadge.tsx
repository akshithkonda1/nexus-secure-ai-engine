export default function VerificationBadge({ ok }:{ ok:boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded
      ${ok ? "bg-emerald-600/10 text-emerald-600" : "bg-amber-600/10 text-amber-600"}`}>
      {ok ? "Verified" : "Unverified"}
    </span>
  );
}
