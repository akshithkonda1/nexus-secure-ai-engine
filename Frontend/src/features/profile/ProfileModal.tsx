import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useUIStore } from "@/shared/state/ui";
import { getStoredProfile, setStoredProfile, type StoredProfile } from "@/services/storage/profile";

const schema = z.object({
  displayName: z
    .string()
    .min(2, "Display name is too short")
    .max(60, "Display name is too long")
    .transform((value) => value.trim()),
  avatarFile: z.any().optional().nullable(),
});

type ProfileForm = z.infer<typeof schema>;

const ACCEPTED_MIME = ["image/png", "image/jpeg", "image/jpg", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024;

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ProfileModal({ onProfileChange }: { onProfileChange?: (profile: StoredProfile) => void }): JSX.Element {
  const { push } = useToast();
  const isOpen = useUIStore((state) => state.isProfileModalOpen);
  const closeProfileModal = useUIStore((state) => state.closeProfileModal);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAvatarRemoved, setAvatarRemoved] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const storedProfile = getStoredProfile();

  const form = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: storedProfile.displayName,
      avatarFile: null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      const current = getStoredProfile();
      form.reset({ displayName: current.displayName, avatarFile: null });
      setPreviewUrl(current.avatarDataUrl);
      setSelectedFile(null);
      setAvatarRemoved(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleClose = (open: boolean) => {
    if (!open) {
      closeProfileModal();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) {
      return;
    }
    const file = files[0];
    if (!ACCEPTED_MIME.includes(file.type)) {
      form.setError("avatarFile", { type: "manual", message: "Use PNG, JPG, WEBP, or GIF" });
      return;
    }
    if (file.size > MAX_BYTES) {
      form.setError("avatarFile", { type: "manual", message: "Avatar must be 8MB or less" });
      return;
    }
    setSelectedFile(file);
    setAvatarRemoved(false);
    void form.trigger("avatarFile");
    form.clearErrors("avatarFile");
    form.setValue("avatarFile", file, { shouldDirty: true, shouldValidate: true });
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl(nextPreview);
  };

  const handleRemovePhoto = () => {
    setSelectedFile(null);
    setAvatarRemoved(true);
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    form.setValue("avatarFile", null, { shouldDirty: true });
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setSaving(true);
    let avatarDataUrl = storedProfile.avatarDataUrl;

    if (selectedFile) {
      avatarDataUrl = await fileToDataUrl(selectedFile);
      await wait(400);
    }

    if (isAvatarRemoved) {
      avatarDataUrl = null;
    }

    const updated: StoredProfile = {
      displayName: values.displayName,
      avatarDataUrl,
      updatedAt: new Date().toISOString(),
    };

    setStoredProfile(updated);
    window.dispatchEvent(new Event("nexus-profile-updated"));
    onProfileChange?.(updated);
    push({ title: "Profile saved", description: "Your Nexus presence has been refreshed." });
    setSaving(false);
    closeProfileModal();
  });

  const canSave = form.formState.isValid && (form.formState.isDirty || selectedFile !== null || isAvatarRemoved) && !isSaving;
  const displayNamePreview = form.watch("displayName") ?? storedProfile.displayName;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent aria-describedby="profile-modal-description">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription id="profile-modal-description">
            Update how you appear across the Nexus workspace. Changes apply across chats and shared assets.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {previewUrl ? <AvatarImage src={previewUrl} alt={displayNamePreview} /> : null}
              <AvatarFallback>{displayNamePreview.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar">Workspace photo</Label>
              <Input id="avatar" type="file" accept={ACCEPTED_MIME.join(",")} onChange={handleFileChange} />
              {selectedFile ? (
                <p className="mt-2 text-xs text-muted">Photo ready. Save to keep your new avatar.</p>
              ) : isAvatarRemoved ? (
                <p className="mt-2 text-xs text-muted">Default avatar will be restored when you save.</p>
              ) : null}
              {form.formState.errors.avatarFile ? (
                <p className="mt-1 text-xs text-red-500">{form.formState.errors.avatarFile.message}</p>
              ) : null}
              <Button variant="link" type="button" className="px-0 text-sm" onClick={handleRemovePhoto}>
                Remove photo
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" {...form.register("displayName")} />
            {form.formState.errors.displayName ? (
              <p className="text-xs text-red-500">{form.formState.errors.displayName.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={() => closeProfileModal()}>
              Cancel
            </Button>
            <Button type="submit" disabled={!canSave}>
              {isSaving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
