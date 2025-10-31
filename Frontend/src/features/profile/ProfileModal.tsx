import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/shared/ui/components/dialog";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { Label } from "@/shared/ui/components/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/shared/ui/components/avatar";
import { useUIStore } from "@/shared/state/ui";
import { getProfile, setProfile } from "@/services/storage/profile";
import { logEvent } from "@/shared/lib/audit";

const schema = z.object({
  displayName: z.string().min(2, "Name is too short").max(60, "Name is too long"),
  avatar: z
    .instanceof(File)
    .refine((file) => ["image/png", "image/jpeg", "image/webp", "image/gif"].includes(file.type), {
      message: "Must be PNG, JPG, WEBP, or GIF"
    })
    .refine((file) => file.size <= 8 * 1024 * 1024, { message: "Max file size is 8MB" })
    .optional()
});

type FormValues = z.infer<typeof schema>;

export function ProfileModal() {
  const isOpen = useUIStore((state) => state.isProfileOpen);
  const setOpen = useUIStore((state) => state.setProfileOpen);
  const [initialAvatar, setInitialAvatar] = useState<string | undefined>(undefined);
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      displayName: "",
      avatar: undefined
    }
  });

  useEffect(() => {
    if (!isOpen) return;
    const profile = getProfile();
    form.reset({ displayName: profile.displayName, avatar: undefined });
    setInitialAvatar(profile.avatarUrl);
    setAvatarPreview(profile.avatarUrl);
  }, [isOpen, form]);

  useEffect(() => () => form.reset(), [form]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      form.setValue("avatar", file, { shouldDirty: true });
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarPreview(undefined);
    form.setValue("avatar", undefined, { shouldDirty: true });
  };

  const onSubmit = form.handleSubmit(async ({ displayName, avatar }) => {
    setSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, avatar ? 400 : 200));
      const avatarUrl = avatar ? avatarPreview : avatarPreview ?? undefined;
      const saved = await setProfile({ displayName, avatarUrl });
      toast.success("Profile saved");
      logEvent("profile.saved", { displayName });
      setInitialAvatar(saved.avatarUrl);
      setAvatarPreview(saved.avatarUrl);
      form.reset({ displayName: saved.displayName, avatar: undefined });
      window.dispatchEvent(new CustomEvent("profile:updated", { detail: saved }));
    } finally {
      setSaving(false);
    }
  });

  const isDirty = form.formState.isDirty || avatarPreview !== initialAvatar;

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent aria-describedby="profile-description">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold">Your profile</DialogTitle>
          <DialogDescription id="profile-description" className="text-muted">
            Update your display details. Save is disabled until you make changes.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-6" onSubmit={onSubmit}>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="Profile preview" />
              ) : (
                <AvatarFallback aria-label="Default avatar">NX</AvatarFallback>
              )}
            </Avatar>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button type="button" variant="outline" className="px-3" onClick={() => inputRef.current?.click()}>
                  Upload
                </Button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  onChange={handleFileChange}
                />
                <Button type="button" variant="ghost" onClick={removeAvatar} disabled={!avatarPreview}>
                  Remove
                </Button>
              </div>
              {avatarPreview && avatarPreview !== initialAvatar && (
                <p className="text-xs text-muted">Photo ready. Save to keep your new avatar.</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display name</Label>
            <Input id="displayName" {...form.register("displayName")} autoComplete="name" />
            {form.formState.errors.displayName && (
              <p role="alert" className="text-sm text-red-500">
                {form.formState.errors.displayName.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
