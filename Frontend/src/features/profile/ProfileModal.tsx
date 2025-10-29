import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "../../shared/ui/dialog";
import { Input } from "../../shared/ui/input";
import { Label } from "../../shared/ui/label";
import { Button } from "../../shared/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../../shared/ui/avatar";
import { useToast } from "../../shared/ui/use-toast";
import { useUIStore } from "../../shared/state/ui";
import { readProfile, writeProfile, clearProfileAvatar } from "../../services/storage/profile";

const ACCEPTED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 8 * 1024 * 1024;

const schema = z.object({
  displayName: z
    .string()
    .min(2, "Name must contain at least 2 characters")
    .max(60, "Keep it under 60 characters for readability"),
});

type FormValues = z.infer<typeof schema>;

export function ProfileModal() {
  const profileModalOpen = useUIStore((state) => state.profileModalOpen);
  const setProfileModalOpen = useUIStore((state) => state.setProfileModalOpen);
  const { toast } = useToast();
  const [initialProfile, setInitialProfile] = useState(() => readProfile());
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialProfile.avatarUrl);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [removalQueued, setRemovalQueued] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { displayName: initialProfile.displayName },
    mode: "onChange",
  });

  useEffect(() => {
    if (profileModalOpen) {
      const latest = readProfile();
      setInitialProfile(latest);
      setPreviewUrl(latest.avatarUrl);
      setSelectedFile(null);
      setRemovalQueued(false);
      form.reset({ displayName: latest.displayName });
    }
  }, [form, profileModalOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const helperText = useMemo(() => {
    if (selectedFile) {
      return "Photo ready. Save to keep your new avatar.";
    }
    if (removalQueued) {
      return "Avatar will be removed on save.";
    }
    return "Upload a square image for the best result.";
  }, [removalQueued, selectedFile]);

  const onClose = () => {
    setProfileModalOpen(false);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      toast({
        title: "Unsupported file",
        description: "Choose a PNG, JPG, WEBP, or GIF file.",
      });
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Please select a file under 8MB.",
      });
      return;
    }
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setRemovalQueued(false);
  };

  const handleRemove = () => {
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
    setSelectedFile(null);
    setRemovalQueued(true);
  };

  const convertFileToDataUrl = async (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = (error) => reject(error);
      reader.readAsDataURL(file);
    });

  const onSubmit = form.handleSubmit(async (values) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    let avatarUrl = previewUrl;
    if (selectedFile) {
      avatarUrl = await convertFileToDataUrl(selectedFile);
    }
    if (removalQueued) {
      avatarUrl = null;
      clearProfileAvatar();
    }
    const payload = { displayName: values.displayName, avatarUrl: avatarUrl ?? null };
    writeProfile(payload);
    setInitialProfile(payload);
    toast({ title: "Profile updated", description: "Your changes have been saved." });
    setProfileModalOpen(false);
  });

  const isDirty = form.formState.isDirty || selectedFile !== null || removalQueued;

  return (
    <Dialog open={profileModalOpen} onOpenChange={setProfileModalOpen}>
      <DialogContent aria-describedby="profile-modal-description">
        <DialogHeader>
          <DialogTitle>Edit profile</DialogTitle>
          <DialogDescription id="profile-modal-description">
            Update your workspace identity and avatar.
          </DialogDescription>
        </DialogHeader>
        <form className="mt-4 flex flex-col gap-6" onSubmit={onSubmit}>
          <div className="flex items-start gap-4">
            <Avatar className="h-16 w-16">
              {previewUrl ? <AvatarImage src={previewUrl} alt="Avatar preview" /> : null}
              <AvatarFallback>{form.watch("displayName")?.[0]?.toUpperCase() ?? "N"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col gap-2 text-sm">
              <Label htmlFor="displayName">Display name</Label>
              <Input id="displayName" {...form.register("displayName")} placeholder="Your display name" />
              <p className="text-xs text-muted">{helperText}</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => document.getElementById("avatar-upload")?.click()}>
                  Upload photo
                </Button>
                <input
                  id="avatar-upload"
                  type="file"
                  accept={ACCEPTED_TYPES.join(",")}
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button type="button" variant="ghost" size="sm" onClick={handleRemove}>
                  Remove photo
                </Button>
              </div>
            </div>
          </div>
          {form.formState.errors.displayName ? (
            <p className="text-sm text-red-400">{form.formState.errors.displayName.message}</p>
          ) : null}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!isDirty || !form.formState.isValid}>
              Save changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
