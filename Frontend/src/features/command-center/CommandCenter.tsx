import React, { useEffect } from "react";

import { CommandCenterOverlay } from "@/components/command-center/CommandCenterOverlay";

type CommandCenterProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function CommandCenter({ isOpen, onClose }: CommandCenterProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  return <CommandCenterOverlay open={isOpen} onClose={onClose} />;
}
