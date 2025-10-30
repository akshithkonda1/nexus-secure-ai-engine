import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useUIStore } from "@/shared/state/ui";
import { logEvent } from "@/shared/lib/audit";
import {
  PROFILE_STORAGE_QUOTA_ERROR,
  getStoredProfile,
  setStoredProfile,
  type ProfilePersistenceResult,
  type StoredProfile,
} from "@/services/storage/profile";

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

const TARGET_DATA_URL_LENGTH = 2_500_000; // ~2.5 MB
const MAX_RENDER_DIMENSION = 512;
const MIN_JPEG_QUALITY = 0.55;

async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

async function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Failed to load avatar preview"));
    image.src = dataUrl;
  });
}

async function createOptimizedAvatarDataUrl(file: File): Promise<string> {
  const originalDataUrl = await fileToDataUrl(file);

  if (originalDataUrl.length <= TARGET_DATA_URL_LENGTH) {
    return originalDataUrl;
  }

  if (typeof document === "undefined") {
    return originalDataUrl;
  }

  try {
    const image = await loadImage(originalDataUrl);
    const scale = Math.min(1, MAX_RENDER_DIMENSION / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) {
      return originalDataUrl;
    }

    context.drawImage(image, 0, 0, width, height);

    let quality = 0.9;
    let optimized = canvas.toDataURL("image/jpeg", quality);

    while (optimized.length > TARGET_DATA_URL_LENGTH && quality > MIN_JPEG_QUALITY) {
      quality -= 0.1;
      optimized = canvas.toDataURL("image/jpeg", quality);
    }

    if (optimized.length >= originalDataUrl.length) {
      return originalDataUrl;
    }

    return optimized;
  } catch (error) {
    console.warn("Falling back to original avatar after optimization failure", error);
    return originalDataUrl;
  }
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function ProfileModal({ onProfileChange }: { onProfileChange?: (profile: StoredProfile) => void }): JSX.Element {
  const { push } = useToast();
  const isOpen = useUIStore((state) => state.isProfileModalOpen);
  const closeProfileModal = useUIStore((state) => state.closeProfileModal);

  const [baseline, setBaseline] = useState<StoredProfile>(() => getStoredProfile());
  const [previewUrl, setPreviewUrl] = useState<string | null>(baseline.avatarDataUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAvatarRemoved, setAvatarRemoved] = useState(false);
  const [isSaving, setSaving] = useState(false);

  const form = useForm<ProfileForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: baseline.displayName,
      avatarFile: null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (isOpen) {
      const current = getStoredProfile();
      setBaseline(current);
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
    try {
      let avatarDataUrl = baseline.avatarDataUrl;

      if (selectedFile) {
        avatarDataUrl = await createOptimizedAvatarDataUrl(selectedFile);
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

      const persistence: ProfilePersistenceResult = setStoredProfile(updated);
      const persistedProfile = persistence.profile;

      logEvent("profile:save", { displayName: persistedProfile.displayName });
      window.dispatchEvent(new Event("nexus-profile-updated"));
      onProfileChange?.(persistedProfile);

      let description = "Your Nexus presence has been refreshed.";
      if (persistence.avatarDropped && persistence.reclaimed) {
        description = "We trimmed workspace history and removed your avatar to save your profile.";
      } else if (persistence.avatarDropped) {
        description = "We removed your avatar to make space, but your profile details are saved.";
      } else if (persistence.reclaimed) {
        description = "We trimmed older workspace history to make room for your profile.";
      }

      push({
        title: "Profile saved",
        description,
      });

      setBaseline(persistedProfile);
      setPreviewUrl((previous) => {
        if (previous?.startsWith("blob:")) {
          URL.revokeObjectURL(previous);
        }
        return persistedProfile.avatarDataUrl;
      });
      setSelectedFile(null);
      setAvatarRemoved(false);
      form.reset({ displayName: persistedProfile.displayName, avatarFile: null });

      closeProfileModal();
    } catch (error) {
      console.error("Failed to save profile", error);
      const message = error instanceof Error ? error.message : "";
      if (message === PROFILE_STORAGE_QUOTA_ERROR) {
        push({
          title: "Storage is full",
          description: "Please delete older chats or logs, then try saving your profile again.",
        });
      } else {
        push({
          title: "Profile not saved",
          description: "We couldn't store your changes. Please try again.",
        });
      }
    } finally {
      setSaving(false);
    }
  });

  const canSave = form.formState.isValid && form.formState.isDirty && !isSaving;
  const displayNamePreview = form.watch("displayName") ?? baseline.displayName;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent aria-describedby="profile-modal-description" className="round-card shadow-ambient">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription id="profile-modal-description">
            Update how you appear across the Nexus workspace. Changes apply across chats and shared assets.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5" onSubmit={onSubmit}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 shadow-ambient">
              {previewUrl ? <AvatarImage src={previewUrl} alt={displayNamePreview} /> : null}
              <AvatarFallback>{displayNamePreview.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div>
              <Label htmlFor="avatar">Workspace photo</Label>
              <Input id="avatar" type="file" accept={ACCEPTED_MIME.join(",")} onChange={handleFileChange} className="round-input" />
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
            <Input id="displayName" className="round-input" {...form.register("displayName")} />
            {form.formState.errors.displayName ? (
              <p className="text-xs text-red-500">{form.formState.errors.displayName.message}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" className="round-btn" onClick={() => closeProfileModal()}>
              Cancel
            </Button>
            <Button type="submit" className="round-btn shadow-press" disabled={!canSave}>
              {isSaving ? (
                <span className="inline-flex items-center gap-2 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </span>
              ) : (
                "Save"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
