import { Dialog, Switch, Transition } from "@headlessui/react";
import { Camera, Check, Loader2, LogOut, Shield, X } from "lucide-react";
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useProfile } from "@/features/profile/ProfileProvider";
import { requestSignOut } from "@/lib/actions";
import { cn } from "@/shared/lib/cn";
import ImageCropDialog from "@/components/ImageCropDialog";
import { readFileAsDataURL, downscale } from "@/utils/imageTools";

const MAX_AVATAR_BYTES = 50 * 1024 * 1024; // 50 MB
const TIMEZONES = [
  "America/Los_Angeles",
  "America/Chicago",
  "America/New_York",
  "Europe/London",
  "Europe/Paris",
  "Asia/Singapore",
  "Asia/Tokyo",
] as const;

type ProfileModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

type Notifications = {
  productUpdates: boolean;
  weeklyDigest: boolean;
  securityAlerts: boolean;
};

type FormState = {
  fullName: string;
  handle: string;
  role: string;
  email: string;
  workspace: string;
  timezone: (typeof TIMEZONES)[number];
  phone: string;
  avatarUrl: string | null;
  notifications: Notifications;
};

function toInitialState(profile: ReturnType<typeof useProfile>["profile"]): FormState {
  const defaults: Notifications = {
    productUpdates: true,
    weeklyDigest: true,
    securityAlerts: true,
  };
  const notifications = { ...defaults, ...(profile?.notifications ?? {}) };

  return {
    fullName: profile?.fullName ?? "",
    handle: profile?.handle ?? "",
    role: profile?.role ?? "",
    email: profile?.email ?? "",
    workspace: profile?.workspace ?? "",
    timezone: (profile?.timezone as FormState["timezone"]) ?? TIMEZONES[0],
    phone: profile?.phone ?? "",
    avatarUrl: profile?.avatarUrl ?? null,
    notifications,
  };
}

type Errors = Partial<Record<keyof FormState, string>> & { form?: string };

function validate(f: FormState): Errors {
  const errors: Errors = {};

  if (!f.fullName.trim()) errors.fullName = "Full name is required.";
  if (!f.handle.trim()) errors.handle = "Handle is required.";
  if (f.handle && !/^@?[a-zA-Z0-9._-]{2,30}$/.test(f.handle))
    errors.handle = "Use 2–30 letters/numbers/._-";
  if (!f.email.trim()) errors.email = "Email is required.";
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email))
    errors.email = "Enter a valid email.";
  if (f.phone && !/^[\d+()\-.\s]{7,20}$/.test(f.phone))
    errors.phone = "Enter a valid phone number.";
  // workspace is optional; add a rule if you need it to be non-empty.

  return errors;
}

function isEqualForm(a: FormState, b: FormState) {
  return JSON.stringify(a) === JSON.stringify(b);
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { profile, loading, saving, error, update } = useProfile();
  const [form, setForm] = useState<FormState>(() => toInitialState(profile));
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [compressedNotice, setCompressedNotice] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [pendingSrc, setPendingSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const initial = useMemo(() => toInitialState(profile), [profile]);
  const busy = loading || saving;

  useEffect(() => {
    if (open) {
      setForm(toInitialState(profile));
      setErrors({});
      setStatus("idle");
      setLocalError(null);
      setCompressedNotice(false);
      setCropOpen(false);
      setPendingSrc(null);
    }
  }, [profile, open]);

  const avatarInitials = useMemo(() => {
    if (!form.fullName) return "AI";
    return form.fullName
      .split(" ")
      .filter(Boolean)
      .map((part) => part[0]!.toUpperCase())
      .slice(0, 2)
      .join("");
  }, [form.fullName]);

  const handleFile = useCallback(async (file: File) => {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setLocalError("Avatar must be PNG, JPEG, or WebP.");
      return;
    }
    try {
      const raw = await readFileAsDataURL(file);
      const needsCompress = file.size > MAX_AVATAR_BYTES;
      const prepped = needsCompress ? await downscale(raw, 1600, 0.9) : raw;
      setLocalError(null);
      setCompressedNotice(needsCompress);
      setPendingSrc(prepped);
      setCropOpen(true);
    } catch {
      setLocalError("Unable to process image.");
    }
  }, []);

  const onSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setStatus("idle");
      setLocalError(null);

      const next: FormState = {
        ...form,
        fullName: form.fullName.trim(),
        handle: form.handle.startsWith("@") ? form.handle.trim() : `@${form.handle.trim()}`,
        role: form.role.trim(),
        email: form.email.trim(),
        workspace: form.workspace.trim(),
        phone: form.phone.trim(),
        // timezone, avatarUrl, notifications unchanged
      };

      const v = validate(next);
      setErrors(v);
      if (Object.keys(v).length > 0) {
        setStatus("error");
        return;
      }

      try {
        await update({
          fullName: next.fullName,
          handle: next.handle,
          role: next.role,
          email: next.email,
          workspace: next.workspace,
          timezone: next.timezone,
          phone: next.phone || null,
          avatarUrl: next.avatarUrl ?? undefined,
          notifications: { ...next.notifications },
        });
        setForm(next);
        setStatus("success");
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unable to update profile.";
        setLocalError(message);
        setStatus("error");
      }
    },
    [form, update],
  );

  const close = useCallback(() => onOpenChange(false), [onOpenChange]);

  const dirty = useMemo(() => !isEqualForm(form, initial), [form, initial]);
  const invalid = Object.keys(validate(form)).length > 0;
  const saveDisabled = busy || invalid || !dirty;

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
                  {/* Left column */}
                  <div className="space-y-6">
                    <div className="flex items-start justify-between">
                      <Dialog.Title className="text-2xl font-semibold text-[rgb(var(--text))]">
                        Profile
                      </Dialog.Title>
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
                      Manage how people see you across Ryuzen. Changes sync instantly once saved.
                    </p>

                    <div className="space-y-4">
                      <div className="relative mx-auto flex size-28 items-center justify-center overflow-hidden rounded-[22px] border border-[rgba(var(--border),0.7)] bg-[rgba(var(--panel),0.7)] shadow-[var(--shadow-soft)]">
                        {form.avatarUrl ? (
                          <img src={form.avatarUrl} alt="Profile avatar" className="h-full w-full object-cover" />
                        ) : (
                          <span className="text-2xl font-semibold text-brand" aria-label="Avatar initials">
                            {avatarInitials}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={(event) => {
                            if (form.avatarUrl && !(event.altKey || event.metaKey || event.shiftKey || event.ctrlKey)) {
                              event.preventDefault();
                              setPendingSrc(form.avatarUrl);
                              setCropOpen(true);
                              return;
                            }
                            fileInputRef.current?.click();
                          }}
                          className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand),0.9)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--on-accent))] shadow-[var(--shadow-soft)]"
                        >
                          <Camera className="size-3.5" /> Edit
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/png,image/jpeg,image/webp"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              void handleFile(file);
                              e.currentTarget.value = "";
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

                    <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.7)] p-4 text-sm text-[rgb(var(--text))]">
                      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.26em] text-brand">
                        <Shield className="size-4" /> Workspace
                      </div>
                      <p className="mt-2 text-sm text-[rgba(var(--subtle),0.8)]">
                        Keep your details up to date so governance and alerts go to the right owner.
                      </p>
                    </div>

                    <div className="space-y-3 text-xs text-[rgba(var(--subtle),0.7)]">
                      <p>Logged in as {profile?.email ?? form.email}</p>
                      {error && <p className="text-[rgb(var(--brand))]">{error}</p>}
                      {status === "success" && !localError && (
                        <p className="text-[rgb(var(--brand))]">Profile saved successfully.</p>
                      )}
                      {localError && <p className="text-[rgb(var(--accent-rose))]">{localError}</p>}
                      {compressedNotice && (
                        <p className="text-xs text-[rgba(var(--subtle),0.8)]">
                          Original image exceeded 50 MB — compressed automatically.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right column */}
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Full name"
                        required
                        value={form.fullName}
                        error={errors.fullName}
                        onChange={(value) => setForm((p) => ({ ...p, fullName: value }))}
                      />
                      <Field
                        label="Handle"
                        required
                        helper="Visible to teammates"
                        value={form.handle}
                        error={errors.handle}
                        onChange={(value) =>
                          setForm((p) => ({ ...p, handle: value.startsWith("@") ? value : `@${value}` }))
                        }
                      />
                      <Field
                        label="Role"
                        value={form.role}
                        onChange={(value) => setForm((p) => ({ ...p, role: value }))}
                      />
                      <Field
                        label="Workspace"
                        value={form.workspace}
                        onChange={(value) => setForm((p) => ({ ...p, workspace: value }))}
                      />
                      <Field
                        label="Email"
                        type="email"
                        required
                        value={form.email}
                        error={errors.email}
                        onChange={(value) => setForm((p) => ({ ...p, email: value }))}
                      />
                      <Field
                        label="Phone"
                        type="tel"
                        value={form.phone}
                        error={errors.phone}
                        onChange={(value) => setForm((p) => ({ ...p, phone: value }))}
                      />
                      <label className="flex flex-col gap-2 text-sm text-[rgb(var(--text))]">
                        <span className="font-semibold">Timezone</span>
                        <select
                          value={form.timezone}
                          onChange={(event) => setForm((p) => ({ ...p, timezone: event.target.value as FormState["timezone"] }))}
                          className="h-11 rounded-xl border border-[rgba(var(--border),0.7)] bg-[rgba(var(--surface),0.7)] px-3 text-sm outline-none focus:border-brand"
                        >
                          {TIMEZONES.map((zone) => (
                            <option key={zone} value={zone}>
                              {zone.replaceAll("_", " ")}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>

                    <fieldset className="space-y-4 rounded-2xl border border-[rgba(var(--border),0.6)] bg-[rgba(var(--surface),0.7)] p-5">
                      <legend className="text-sm font-semibold text-[rgb(var(--text))]">Notifications</legend>
                      <Toggle
                        label="Weekly digest"
                        description="Friday summary of agent activity across your workspace"
                        checked={form.notifications.weeklyDigest}
                        onChange={(value) =>
                          setForm((p) => ({ ...p, notifications: { ...p.notifications, weeklyDigest: value } }))
                        }
                      />
                      <Toggle
                        label="Product updates"
                        description="Major launches, policy updates, and roadmap invitations"
                        checked={form.notifications.productUpdates}
                        onChange={(value) =>
                          setForm((p) => ({ ...p, notifications: { ...p.notifications, productUpdates: value } }))
                        }
                      />
                      <Toggle
                        label="Security alerts"
                        description="Critical incidents, retention changes, and governance tasks"
                        checked={form.notifications.securityAlerts}
                        onChange={(value) =>
                          setForm((p) => ({ ...p, notifications: { ...p.notifications, securityAlerts: value } }))
                        }
                      />
                    </fieldset>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <button
                        type="button"
                        onClick={() => {
                          void requestSignOut();
                          close();
                        }}
                        className="inline-flex items-center gap-2 rounded-2xl border border-[rgba(var(--border),0.7)] px-4 py-2 text-sm font-semibold text-[rgba(var(--subtle),0.8)] transition hover:text-brand"
                      >
                        <LogOut className="size-4" /> Sign out
                      </button>
                      <button
                        type="submit"
                        className="inline-flex items-center gap-2 rounded-2xl bg-[rgba(var(--brand),1)] px-6 py-2 text-sm font-semibold text-[rgb(var(--on-accent))] shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-lift)] disabled:cursor-not-allowed disabled:opacity-60"
                        disabled={saveDisabled}
                        aria-disabled={saveDisabled}
                        title={invalid ? "Fix validation errors to save" : dirty ? "" : "No changes to save"}
                      >
                        {busy ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                        Save changes
                      </button>
                    </div>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
      <ImageCropDialog
        open={cropOpen && Boolean(pendingSrc)}
        src={pendingSrc ?? ""}
        onClose={() => {
          setCropOpen(false);
          setPendingSrc(null);
        }}
        onCropped={(dataUrl) => {
          setCropOpen(false);
          setPendingSrc(null);
          setForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
        }}
      />
    </Transition.Root>
  );
}

/* ---------- Reusable Field / Toggle ---------- */

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  helper?: string;
  error?: string;
};

function Field({ label, value, onChange, type = "text", required, helper, error }: FieldProps) {
  const id = useMemo(() => `fld_${label.replace(/\s+/g, "_").toLowerCase()}`, [label]);
  return (
    <label htmlFor={id} className="flex flex-col gap-2 text-sm text-[rgb(var(--text))]">
      <span className="font-semibold">
        {label}
        {required ? <span className="ml-1 text-[rgba(var(--brand),0.9)]">*</span> : null}
      </span>
      <input
        id={id}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-err` : undefined}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={cn(
          "h-11 rounded-xl border px-3 text-sm outline-none transition focus:border-brand focus:ring-2 focus:ring-[rgba(var(--brand),0.2)]",
          "bg-[rgba(var(--surface),0.7)] border-[rgba(var(--border),0.7)]",
          error && "border-[rgba(var(--accent-rose),0.7)]"
        )}
      />
      {helper ? <span className="text-xs text-[rgba(var(--subtle),0.7)]">{helper}</span> : null}
      {error ? (
        <span id={`${id}-err`} className="text-xs text-[rgb(var(--accent-rose))]">
          {error}
        </span>
      ) : null}
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
      <div className="flex items-center justify-between gap-4 text-sm">
        <div className="flex-1 space-y-1">
          <Switch.Label className="block font-semibold text-[rgb(var(--text))]">{label}</Switch.Label>
          <Switch.Description className="block text-xs text-[rgba(var(--subtle),0.8)]">{description}</Switch.Description>
        </div>
        <Switch
          checked={checked}
          onChange={onChange}
          className={cn(
            "relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer items-center rounded-full border transition",
            checked
              ? "border-transparent bg-[rgba(var(--brand),0.9)]"
              : "border-[rgba(var(--border),0.45)] bg-[rgba(var(--surface),0.92)]",
          )}
        >
          <span
            aria-hidden
            className={cn(
              "inline-block size-5 rounded-full bg-[rgb(var(--surface))] shadow-[0_2px_6px_rgba(15,23,42,0.22)] transition",
              checked ? "translate-x-6" : "translate-x-1"
            )}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}

