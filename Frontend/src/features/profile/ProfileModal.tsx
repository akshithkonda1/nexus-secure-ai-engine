import React, { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/shared/ui/components/dialog";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/components/avatar";
import { useProfile } from "@/shared/hooks/useProfile";
import { useUIState } from "@/shared/state/ui";
import { useToast } from "@/shared/ui/components/toast";

const MAX_FILE_SIZE = 8 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"] as const;

const avatarFileSchema = z
  .any()
  .transform(value => {
    if (typeof File === "undefined") return null;
    return value instanceof File ? value : null;
  })
  .superRefine((file: File | null, ctx) => {
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type as (typeof ACCEPTED_TYPES)[number])) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Upload PNG, JPG, WEBP, or GIF images only."
      });
    }
    if (file.size > MAX_FILE_SIZE) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Images must be 8 MB or smaller."
      });
    }
  });

const profileSchema = z.object({
  displayName: z
    .string()
    .min(2, "Display name must be at least 2 characters.")
    .max(60, "Display name must be 60 characters or fewer."),
  avatarFile: avatarFileSchema
});

export type ProfileFormValues = z.infer<typeof profileSchema>;

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

export default function ProfileModal() {
  const { profile, isLoading, saveProfile, isSaving } = useProfile();
  const { profileOpen, closeProfile } = useUIState();
  const { toast } = useToast();

  const [preview, setPreview] = useState<string | null>(null);
  const [hasUnsavedAvatar, setHasUnsavedAvatar] = useState(false);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    mode: "onChange",
    defaultValues: {
      displayName: profile?.displayName ?? "",
      avatarFile: null
    }
  });

  const { register, handleSubmit, reset, setValue, formState } = form;

  useEffect(() => {
    if (!profileOpen) return;
    reset({
      displayName: profile?.displayName ?? "",
      avatarFile: null
    });
    setPreview(profile?.avatarDataUrl ?? null);
    setHasUnsavedAvatar(false);
  }, [profile, profileOpen, reset]);

  useEffect(() => {
    if (!profileOpen) return;
    const nameField = document.getElementById("profile-display-name") as HTMLInputElement | null;
    nameField?.focus();
  }, [profileOpen]);

  const avatarFallback = useMemo(() => {
    const source = profile?.displayName ?? "N";
    return source.slice(0, 1).toUpperCase();
  }, [profile?.displayName]);

  const onAvatarSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setValue("avatarFile", null, { shouldDirty: true, shouldTouch: true });
      return;
    }

    const parsed = avatarFileSchema.safeParse(file);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      toast({ title: "Avatar error", description: issue?.message ?? "File not supported." });
      event.target.value = "";
      return;
    }

    try {
      const dataUrl = await readAsDataUrl(file);
      setPreview(dataUrl);
      setHasUnsavedAvatar(true);
      setValue("avatarFile", file, { shouldDirty: true, shouldTouch: true });
    } catch (error) {
      console.error(error);
      toast({ title: "Avatar error", description: "Could not preview the selected image." });
    } finally {
      event.target.value = "";
    }
  };

  const handleRemoveAvatar = () => {
    setPreview(null);
    setHasUnsavedAvatar(true);
    setValue("avatarFile", null, { shouldDirty: true, shouldTouch: true });
  };

  const onSubmit = handleSubmit(async values => {
    const currentProfile: StoredProfile =
      profile ?? {
        id: "local-user",
        displayName: values.displayName,
        avatarDataUrl: null,
        updatedAt: Date.now()
      };
    let avatarDataUrl = preview;

    if (values.avatarFile && hasUnsavedAvatar) {
      await new Promise(resolve => setTimeout(resolve, 400));
      avatarDataUrl = await readAsDataUrl(values.avatarFile);
    }

    if (!values.avatarFile && hasUnsavedAvatar) {
      avatarDataUrl = null;
    }

    await saveProfile({
      id: currentProfile.id,
      displayName: values.displayName,
      avatarDataUrl,
      updatedAt: Date.now()
    });

    toast({ title: "Profile saved", description: "Settings stored locally." });
    setHasUnsavedAvatar(false);
    closeProfile();
  });

  const disableSave = !formState.isDirty || formState.isSubmitting || isSaving;

  return (
    <Dialog open={profileOpen} onOpenChange={open => (!open ? closeProfile() : null)}>
      <DialogContent aria-describedby={undefined} className="max-h-[90vh] overflow-y-auto">
        <DialogTitle>Edit profile</DialogTitle>
        <DialogDescription className="sr-only">Update your display name and avatar.</DialogDescription>
        <form className="mt-4 space-y-6" onSubmit={onSubmit}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {preview ? <AvatarImage src={preview} alt="Profile preview" /> : <AvatarFallback>{avatarFallback}</AvatarFallback>}
            </Avatar>
            <div className="space-x-2">
              <input
                type="file"
                accept={ACCEPTED_TYPES.join(",")}
                onChange={onAvatarSelected}
                className="hidden"
                id="profile-avatar-input"
              />
              <Button type="button" variant="outline" onClick={() => document.getElementById("profile-avatar-input")?.click()}>
                Choose photo
              </Button>
              <Button type="button" variant="ghost" onClick={handleRemoveAvatar}>
                Remove photo
              </Button>
            </div>
          </div>
          {hasUnsavedAvatar ? (
            <p className="text-sm text-muted-foreground">Photo ready. Save to keep your new avatar.</p>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="profile-display-name">Display name</Label>
            <Input id="profile-display-name" autoFocus {...register("displayName") } />
            {formState.errors.displayName ? (
              <p className="text-sm text-red-500">{formState.errors.displayName.message}</p>
            ) : null}
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={closeProfile}>
              Cancel
            </Button>
            <Button type="submit" disabled={disableSave}>
              {formState.isSubmitting || isSaving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
        {isLoading ? <p className="mt-4 text-sm text-muted-foreground">Loading profile…</p> : null}
      </DialogContent>
    </Dialog>
  );
}
