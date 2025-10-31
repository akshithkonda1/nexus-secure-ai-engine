import React from "react";
import { Button } from "@/shared/ui/components/button";

const Chip = ({ label, onClick }: { label: string; onClick: () => void }) => (
  <Button onClick={onClick} variant="secondary" className="h-14 px-6 rounded-xl text-base shadow-sm">
    {label}
  </Button>
);

export default function WelcomeHub() {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-3">Welcome to Nexus</h1>
      <p className="text-neutral-600 dark:text-neutral-300 mb-8">
        Get started by giving Nexus a task—then let it do the rest.
      </p>
      <div className="grid grid-cols-2 gap-4 place-content-center max-w-xl mx-auto">
        <Chip label="Write copy" onClick={() => location.assign("/chat?preset=copy")} />
        <Chip label="Image generation" onClick={() => location.assign("/chat?preset=image")} />
        <Chip label="Create avatar" onClick={() => location.assign("/chat?preset=avatar")} />
        <Chip label="Write code" onClick={() => location.assign("/chat?preset=code")} />
      </div>
    </div>
  );
}
