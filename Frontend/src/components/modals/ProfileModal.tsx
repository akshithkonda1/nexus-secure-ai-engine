import { useEffect, useRef, useState } from "react";
import {
  Calendar,
  KeyRound,
  Lock,
  Mail,
  Upload,
  User as UserIcon
} from "lucide-react";
import { useAuth } from "@/state/useAuth";
import { useModal } from "@/state/useModal";

export function ProfileModal() {
  const { openKey, close } = useModal();
  const open = openKey === "profile";
  const { user, updateProfile, updateEmail, updatePassword } = useAuth();
  const isSocial = user.provider !== "password";

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [dob, setDob] = useState(user.dob ?? "");
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [pwd, setPwd] = useState("");
  const [saving, setSaving] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(user.name);
    setEmail(user.email);
    setDob(user.dob ?? "");
    setAvatarUrl(user.avatarUrl ?? "");
    setPwd("");
  }, [open, user.avatarUrl, user.dob, user.email, user.name]);

  if (!open) return null;

  function onPick() {
    fileRef.current?.click();
  }

  function onFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      alert("Max avatar size is 2MB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarUrl(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    setSaving(true);
    try {
      await updateProfile({ name, avatarUrl, ...(isSocial ? {} : { dob }) });
      if (!isSocial && email !== user.email) {
        await updateEmail(email);
      }
      if (!isSocial && pwd) {
        await updatePassword(pwd);
      }
      alert("Profile updated.");
      close();
    } catch (error) {
      console.error("Failed to update profile", error);
      alert("Failed to update profile. Try again.");
    } finally {
      setSaving(false);
    }
  }

  const LockBadge = ({ label }: { label: string }) => (
    <span
      title={label}
      className="inline-flex items-center gap-1 rounded-lg border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-2 py-0.5 text-[10px]"
    >
      <Lock className="h-3 w-3" /> Locked (social)
    </span>
  );

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/40">
      <div className="w-full max-w-3xl rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--surface))] p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-semibold">View profile</h3>
          <button onClick={close} className="rounded-xl border border-[color:rgba(var(--border))] px-3 py-1.5">
            Close
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-[160px,1fr]">
          <div className="flex flex-col items-center gap-3">
            <div className="relative grid h-32 w-32 place-items-center overflow-hidden rounded-2xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))]">
              {avatarUrl ? (
                <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 opacity-60" />
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
            <button onClick={onPick} className="inline-flex items-center gap-2 rounded-xl bg-brand px-3 py-2 text-white">
              <Upload className="h-4 w-4" /> Import photo
            </button>
          </div>

          <div className="grid gap-4">
            <label className="block">
              <span className="mb-1 block text-sm">Display name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className="w-full rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3 outline-none focus:ring-2 focus:ring-[color:rgba(var(--ring)/.4)]"
                placeholder="Your name"
              />
            </label>

            <label className="block">
              <span className="mb-1 flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4" />
                Email address {isSocial && <LockBadge label="Email is managed by your provider" />}
              </span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                disabled={isSocial}
                className="w-full rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3 outline-none disabled:opacity-60"
                placeholder="you@company.com"
              />
            </label>

            <label className="block">
              <span className="mb-1 flex items-center gap-2 text-sm">
                <KeyRound className="h-4 w-4" />
                Change password {isSocial && <LockBadge label="Password is managed by your provider" />}
              </span>
              <input
                value={pwd}
                onChange={(event) => setPwd(event.target.value)}
                disabled={isSocial}
                type="password"
                className="w-full rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3 outline-none disabled:opacity-60"
                placeholder="New password"
              />
            </label>

            <label className="block">
              <span className="mb-1 flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Date of birth {isSocial && <LockBadge label="Imported from provider" />}
              </span>
              <input
                type="date"
                value={dob}
                onChange={(event) => setDob(event.target.value)}
                disabled={isSocial}
                className="w-full rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] p-3 outline-none disabled:opacity-60"
              />
            </label>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex gap-2">
            <button
              onClick={() => useModal.getState().open("billing-waitlist")}
              className="rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-3 py-2"
            >
              Billing & usage
            </button>
            <button
              onClick={() => useModal.getState().open("feedback")}
              className="rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-3 py-2"
            >
              Support
            </button>
            <button
              onClick={() => useModal.getState().open("refer")}
              className="rounded-xl border border-[color:rgba(var(--border))] bg-[rgb(var(--panel))] px-3 py-2"
            >
              Refer
            </button>
          </div>

          <div className="flex gap-2">
            <button onClick={close} className="rounded-xl border border-[color:rgba(var(--border))] px-4 py-2">
              Cancel
            </button>
            <button
              onClick={saveProfile}
              disabled={saving}
              className="rounded-xl bg-brand px-4 py-2 text-white shadow-[var(--elev-1)] hover:shadow-[var(--elev-2)] disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
