import { useEffect, useState } from "react";
import { fetchCapabilities, type Capabilities } from "@/services/api/client";
import { Link } from "react-router-dom";
import { isLocked } from "@/shared/lib/lock";

export function WelcomeHub() {
  const [caps, setCaps] = useState<Capabilities | null>(null);
  const { locked, untilISO } = isLocked();

  useEffect(() => {
    fetchCapabilities().then(setCaps);
  }, []);

  const Chip = ({ label, to, disabled }: { label: string; to: string; disabled?: boolean }) => (
    <Link
      to={disabled ? "#" : to}
      aria-disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border hover:bg-muted/40 ${
        disabled ? "opacity-50 pointer-events-none" : ""
      }`}
    >
      {label} {disabled && <span className="text-xs">(unavailable)</span>}
    </Link>
  );

  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-4xl font-semibold mb-2">Welcome to Nexus</h1>
      <p className="text-muted-foreground mb-8">
        Get started by choosing a task. Nexus convenes multiple specialists to cross-check your answer.
      </p>
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <Chip label="Write copy" to="/chat?preset=copy" />
        <Chip label="Create avatar" to="/chat?preset=avatar" disabled={!caps?.studyPacks} />
        <Chip label="Image generation" to="/chat?preset=image" disabled={!caps?.imageGen} />
        <Chip label="Write code" to="/chat?preset=code" disabled={!caps?.codeGen} />
      </div>

      <div className="mx-auto max-w-xl rounded-2xl border bg-muted/10 p-4 text-sm">
        <div className="font-medium mb-1">Free plan</div>
        <div className="text-muted-foreground">
          1 trial deck/day • ≤25 cards • watermarked audit • public sources • no exports.
        </div>
        <button className="mt-3 px-3 py-2 rounded-md border" disabled>
          {locked ? `Upgrade opens ${new Date(untilISO).toLocaleDateString()}` : "Upgrade (locked)"}
        </button>
      </div>
    </div>
  );
}
