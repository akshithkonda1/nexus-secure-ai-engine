import { Dialog, Switch, Transition } from "@headlessui/react";
import { Camera, Check, Loader2, LogOut, Shield, X } from "lucide-react";
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useProfile } from "@/features/profile/ProfileProvider";
import { requestSignOut } from "@/lib/actions";
import { cn } from "@/shared/lib/cn";

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const TIMEZONES = [
  "America/Los_Angeles",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Singapore",
  "Asia/Tokyo",
];

type ProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type FormState = {
  fullName: string;
  handle: string;
  role: string;
  email: string;
  workspace: string;
  timezone: string;
  phone: string;
  avatarUrl: string | null;
  notifications: {
    productUpdates: boolean;
    weeklyDigest: boolean;
    securityAlerts: boolean;
  };
};

function toInitialState(profile: ReturnType<typeof useProfile>["profile"]): FormState {
  const notifications = profile?.notifications ?? {
    productUpdates: true,
    weeklyDigest: true,
    securityAlerts: true,
  };
  return {
    fullName: profile?.fullName ?? "",
    handle: profile?.handle ?? "",
    role: profile?.role ?? "",
    email: profile?.email ?? "",
    workspace: profile?.workspace ?? "",
    timezone: profile?.timezone ?? TIMEZONES[0],
    phone: profile?.phone ?? "",
    avatarUrl: profile?.avatarUrl ?? null,
    notifications: {
      productUpdates: notifications.productUpdates,
      weeklyDigest: notifications.weeklyDigest,
      securityAlerts: notifications.securityAlerts,
    },
  };
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { profile, loading, saving, error, update } = useProfile();
  const [form, setForm] = useState<FormState>(() => toInitialState(profile));
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [localError, setLocalError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (open) {
      setForm(toInitialState(profile));
      setStatus("idle");
      setLocalError(null);
    }
  }, [profile, open]);

  const busy = loading || saving;

  const avatarInitials = useMemo(() => {
    if (!form.fullName) return "AI";
    return form.fullName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();
  }, [form.fullName]);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    if (file.size > MAX_AVATAR_BYTES) {
      setLocalError("Avatar must be under 2MB");
      return;
    }
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error("Unable to read file"));
      reader.readAsDataURL(file);
    });
    setForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
  }, []);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setLocalError(null);
      setStatus("idle");
      try {
        await update({
          fullName: form.fullName.trim(),
          handle: form.handle.trim(),
          role: form.role.trim(),
          email: form.email.trim(),FF
          workspace: form.workspace.trim(),
          timezone: form.timezone,
          phone: form.phone.trim() || null,
          avatarUrl: form.avatarUrl ?? undefined,
          notifications: { ...form.notifications },
        });
        setStatus("success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to update profile";
        setLocalError(message);
        setStatus("error");
      }
    },
    [update, form],
  );

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[100]" onClose={close}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[rgba(3,7,18,0.55)] backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-[110] overflow-y-auto px-4 py-8 sm:px-6">
          <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="translate-y-6 opacity-0"
              enterTo="translate-y-0 opacity-100"
              leave="ease-in duration-150"
              leaveFrom="translate-y-0 opacity-100"
              leaveTo="translate-y-4 opacity-0"
            >
              <Dialog.Panel className="relative w-full overflow-hidden rounded-[28px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.95)] shadow-[var(--shadow-lift)] backdrop-blur-xl">
                <form onSubmit={onSubmit} className="grid gap-8 p-8 lg:grid-cols-[320px,1fr] lg:p-10">
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-2xl font-semibold text-[rgb(var(--text))]">Profile</Dialog.Title>
                      <button
                        type="button"
                        onClick={close}
                        className="inline-flex size-9 items-center justify-center rounded-full border border-[rgba(var(--border),0.6)] text-[rgb(var(--subtle))] transition hover:text-brand"
                        aria-label="Close profile"
                      >
                        <X className="size-4" />
                      </button>
                    </div>
                    <p className="text-sm text-[rgba(var(--subtle),0.8)]">
                      Manage how people see you across Nexus: update your details, security contact, and notification
                      preferences. Changes sync instantly once saved.
                    </p>

                    <div className="space-y-4">
                      <div className="relative mx-auto flex size-28 items-center justify-center overflow-hidden rounded-[22px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.7)] shadow-[var(--shadow-soft)]">
                        {form.avatarUrl ? (
                          <img src={form.avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl font-semibold text-brand">{avatarInitials}</span>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand),0.9)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[var(--shadow-soft)]"
                        >
                          <Camera className="size-3.5" /> Edit
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) {
                              void handleFile(file);
                              event.target.value = "";
                            }
                          }}
                        />
                      </div>
                      {form.avatarUrl && (
                        <button
                          type="button"
                          className="text-xs font-semibold uppercase tracking-[0.26em] text-[rgba(var(--subtle),0.7)] hover:text-brand"
                          onClick={() => setForm((prev) => ({ ...prev, avatarUrl: null }))}
                        >
                          Remove avatar
                        </button>
                      )}
                    </div>

                    <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-white/70 p-4 text-sm text-[rgb(var(--text))]">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-brand">
                        <Shield className="size-4" /> Workspace
                      </div>
                      <p className="mt-2 text-sm text-[rgba(var(--subtle),0.8)]">
                        Updating your contact details keeps alerts routed to the right owner for governance events.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs text-[rgba(var(--subtle),0.7)]">
                      <p>Logged in as {profile?.email ?? form.email}</p>
                      {error && <p className="text-[rgb(var(--brand))]">{error}</p>}
                      {status === "success" && !localError && (
                        <p className="text-[rgb(var(--brand))]">Profile saved successfully.</p>
                      )}
                      {localError && <p className="text-[#ff5c5c]">{localError}</p>}
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Full name"
                        required
                        value={form.fullName}
                        onChange={(value) => setForm((prev) => ({ ...prev, fullName: value }))}
                      />
                      <Field
                        label="Handle"
                        required
                        helper="Visible to teammates"
                        value={form.handle}
                        onChange={(value) => setForm((prev) => ({ ...prev, handle: value.startsWith("@") ? value : `@${value}` }))}
                      />
                      <Field
                        label="Role"
                        value={form.role}
                        onChange={(value) => setForm((prev) => ({ ...prev, role: value }))}
                      />
                      <Field
                        label="Workspace"
                        value={form.workspace}
                        onChange={(value) => setForm((prev) => ({ ...prev, workspace: value }))}
                      />
                      <Field
                        label="Email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(value) => setForm((prev) => ({ ...prev, email: value }))}
                      />
                      <Field
                        label="Phone"
                        type="tel"
                        value={form.phone}
                        onChange={(value) => setForm((prev) => ({ ...prev, phone: value }))}
                      />
                      <label className="flex flex-col gap-2 text-sm text-[rgb(var(--text))]">
                        <span className="font-semibold">Timezone</span>
                        <select
                          value={form.timezone}
                          onChange={(event) => setForm((prev) => ({ ...prev, timezone: event.target.value }))}
                          className="h-11 rounded-xl border border-[rgba(var(--border),0.7)] bg-white/70 px-3 text-sm outline-none focus:border-brand"
                        >
                          {TIMEZONES.map((zone) => (
                            <option key={zone} value={zone}>
                              {zone.replace("_", " ")}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <fieldset className="space-y-4 rounded-2xl border border-[rgba(var(--border),0.6)] bg-white/70 p-5">
                      <legend className="text-sm font-semibold text-[rgb(var(--text))]">Notifications</legend>
                      <Toggle
                        label="Weekly digest"
                        description="Friday summary of agent activity across your workspace"
                        checked={form.notifications.weeklyDigest}
                        onChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, weeklyDigest: value },
                          }))
                        }
                      />
                      <Toggle
                        label="Product updates"
                        description="Major launches, policy updates, and roadmap invitations"
                        checked={form.notifications.productUpdates}
                        onChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, productUpdates: value },
                          }))
                        }
                      />
                      <Toggle
                        label="Security alerts"
                        description="Critical incidents, retention changes, and governance tasks"
                        checked={form.notifications.securityAlerts}
                        onChange={(value) =>
                          setForm((prev) => ({
                            ...prev,
                            notifications: { ...prev.notifications, securityAlerts: value },
                          }))
                        }
                      />
                    </fieldset>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          requestSignOut();
                          close();
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(var(--border),0.7)] px-4 py-2 text-sm font-semibold text-[rgba(var(--subtle),0.8)] transition hover:text-brand"
                      >
                        <LogOut className="size-4" /> Sign out
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-2xl bg-[rgba(var(--brand),1)] px-6 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-lift)] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={busy}
                      >
                        {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} Save changes
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  helper?: string;
};

function Field({ label, value, onChange, type = "text", required, helper }: FieldProps) {
  return (
    <label className="flex flex-col gap-2 text-sm text-[rgb(var(--text))]">
      <span className="font-semibold">
        {label}
        {required ? <span className="ml-1 text-[rgba(var(--brand),0.9)]">*</span> : null}
      </span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 rounded-xl border border-[rgba(var(--border),0.7)] bg-white/70 px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-[rgba(var(--brand),0.2)]"
      />
      {helper ? <span className="text-xs text-[rgba(var(--subtle),0.7)]">{helper}</span> : null}
    </label>
  );
}

type ToggleProps = {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
};

function Toggle({ label, description, checked, onChange }: ToggleProps) {
  return (
    <Switch.Group>
      <div className="flex items-start justify-between gap-3 text-sm">
        <Switch.Label className="space-y-1">
          <div className="font-semibold text-[rgb(var(--text))]">{label}</div>
          <div className="text-xs text-[rgba(var(--subtle),0.8)]">{description}</div>
        </Switch.Label>
        <Switch
          checked={checked}
          onChange={onChange}
          className={cn(
            "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full border transition",
            checked
              ? "border-transparent bg-[rgba(var(--brand),0.9)]"
              : "border-[rgba(var(--border),0.7)] bg-white/80",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "inline-block size-5 rounded-full bg-white shadow transition",
              checked ? "translate-x-5" : "translate-x-1",
            )}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}
