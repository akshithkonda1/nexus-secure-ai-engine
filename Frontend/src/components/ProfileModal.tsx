import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type ProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md p-6 bg-app-surface rounded-lg shadow-lg">
          <Dialog.Title className="text-lg font-semibold mb-4">
            Profile
          </Dialog.Title>
          <Dialog.Description className="mb-4">
            Update your profile details and photo.
          </Dialog.Description>
          {/* Add your profile form here */}
          <div className="flex justify-end">
            <Dialog.Close asChild>
              <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-app bg-app-surface text-ink hover:bg-app-surface/80">
                Close
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
