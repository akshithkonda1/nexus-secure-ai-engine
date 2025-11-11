import { Dialog, Switch, Transition } from "@headlessui/react";
import { Camera, Check, Loader2, LogOut, Shield, X } from "lucide-react";
import React, { Fragment, useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useProfile } from "@/features/profile/ProfileProvider";
import { requestSignOut } from "@/lib/actions";
import { cn } from "@/shared/lib/cn";

const MAX_AVATAR_BYTES = 50 * 1024 * 1024;
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

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

async function dataUrlFromFile(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Unable to read file"));
    reader.readAsDataURL(file);
  });
}

async function compressImageFromFile(file: File, maxDim = 2400, quality = 0.9): Promise<string> {
  const src = await dataUrlFromFile(file);
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const el = new Image();
    el.onload = () => res(el);
    el.onerror = rej;
    el.src = src;
  });
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, w, h);
  return canvas.toDataURL("image/jpeg", quality);
}

export function ProfileModal({ open, onOpenChange }: ProfileModalProps) {
  const { profile, loading, saving, error, update } = useProfile();
  const [form, setForm] = useState<FormState>(() => toInitialState(profile));
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errors, setErrors] = useState<Errors>({});
  const [localError, setLocalError] = useState<string | null>(null);
  const [compressedNotice, setCompressedNotice] = useState(false);
  const [cropOpen, setCropOpen] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);
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
      setCropSrc(null);
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
      const needsCompression = file.size > MAX_AVATAR_BYTES;
      const src = needsCompression
        ? await compressImageFromFile(file, 2400, 0.9)
        : await dataUrlFromFile(file);
      setLocalError(null);
      setCompressedNotice(needsCompression);
      setCropSrc(src);
      setCropOpen(true);
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : "Unable to process file.");
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
                      Manage how people see you across Nexus. Changes sync instantly once saved.
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
                              setCropSrc(form.avatarUrl);
                              setCropOpen(true);
                              return;
                            }
                            fileInputRef.current?.click();
                          }}
                          className="absolute bottom-2 right-2 inline-flex items-center gap-1 rounded-full bg-[rgba(var(--brand),0.9)] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-white shadow-[var(--shadow-soft)]"
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

                    <div className="rounded-2xl border border-[rgba(var(--border),0.6)] bg-white/70 p-4 text-sm text-[rgb(var(--text))]">
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
                      {localError && <p className="text-[#ff5c5c]">{localError}</p>}
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
                          className="h-11 rounded-xl border border-[rgba(var(--border),0.7)] bg-white/70 px-3 text-sm outline-none focus:border-brand"
                        >
                          {TIMEZONES.map((zone) => (
                            <option key={zone} value={zone}>
                              {zone.replaceAll("_", " ")}
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
                        className="inline-flex items-center gap-2 rounded-2xl bg-[rgba(var(--brand),1)] px-6 py-2 text-sm font-semibold text-white shadow-[var(--shadow-soft)] transition hover:shadow-[var(--shadow-lift)] disabled:cursor-not-allowed disabled:opacity-60"
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
      {cropOpen && cropSrc && (
        <AvatarCropDialog
          open={cropOpen}
          src={cropSrc}
          onCancel={() => {
            setCropOpen(false);
            setCropSrc(null);
            setCompressedNotice(false);
          }}
          onSave={(dataUrl) => {
            setCropOpen(false);
            setCropSrc(null);
            setForm((prev) => ({ ...prev, avatarUrl: dataUrl }));
          }}
        />
      )}
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
          "bg-white/70 border-[rgba(var(--border),0.7)]",
          error && "border-[#ff5c5c]"
        )}
      />
      {helper ? <span className="text-xs text-[rgba(var(--subtle),0.7)]">{helper}</span> : null}
      {error ? (
        <span id={`${id}-err`} className="text-xs text-[#ff5c5c]">
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
              "inline-block size-5 rounded-full bg-white shadow-[0_2px_6px_rgba(15,23,42,0.22)] transition",
              checked ? "translate-x-6" : "translate-x-1"
            )}
          />
        </Switch>
      </div>
    </Switch.Group>
  );
}

function AvatarCropDialog({
  open,
  src,
  onCancel,
  onSave,
  size = 512,
}: {
  open: boolean;
  src: string;
  onCancel: () => void;
  onSave: (dataUrl: string) => void;
  size?: number;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [scale, setScale] = useState(1);
  const [minScale, setMinScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const drag = useRef<{ x: number; y: number; px: number; py: number } | null>(null);

  useEffect(() => {
    if (!open) return;
    const img = new Image();
    img.onload = () => {
      setNatural({ w: img.naturalWidth, h: img.naturalHeight });
      const v = 360;
      const s = Math.max(v / img.naturalWidth, v / img.naturalHeight);
      setMinScale(s);
      setScale(s * 1.05);
      setPos({ x: 0, y: 0 });
    };
    img.src = src;
  }, [open, src]);

  const clampPan = useCallback(
    (nx: number, ny: number) => {
      const v = 360;
      if (!natural) return { x: nx, y: ny };
      const dispW = natural.w * scale;
      const dispH = natural.h * scale;
      const minX = v - dispW;
      const minY = v - dispH;
      return { x: clamp(nx, minX, 0), y: clamp(ny, minY, 0) };
    },
    [natural, scale],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.setPointerCapture(e.pointerId);
    drag.current = { x: pos.x, y: pos.y, px: e.clientX, py: e.clientY };
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.px;
    const dy = e.clientY - drag.current.py;
    setPos(clampPan(drag.current.x + dx, drag.current.y + dy));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    drag.current = null;
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const factor = e.deltaY < 0 ? 1.05 : 0.95;
    const nextScale = clamp(scale * factor, minScale, 4);
    setScale(nextScale);
    setPos((p) => clampPan(p.x, p.y));
  };

  const doSave = async () => {
    if (!natural) return;
    const v = 360;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d")!;
    const sx = (-pos.x) / scale;
    const sy = (-pos.y) / scale;
    const sSize = v / scale;
    const img = new Image();
    img.src = src;
    await new Promise((res) => (img.onload = res));
    ctx.drawImage(img, sx, sy, sSize, sSize, 0, 0, size, size);
    onSave(canvas.toDataURL("image/jpeg", 0.92));
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[120]" onClose={onCancel}>
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
        <div className="fixed inset-0 z-[130] overflow-y-auto px-4 py-8 sm:px-6">
          <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200"
              enterFrom="translate-y-6 opacity-0"
              enterTo="translate-y-0 opacity-100"
              leave="ease-in duration-150"
              leaveFrom="translate-y-0 opacity-100"
              leaveTo="translate-y-4 opacity-0"
            >
              <Dialog.Panel className="panel w-full overflow-hidden rounded-2xl p-6">
                <Dialog.Title className="mb-4 text-lg font-semibold">Adjust avatar</Dialog.Title>
                <div
                  ref={wrapRef}
                  className="relative mx-auto size-[360px] overflow-hidden rounded-2xl border border-[rgba(var(--border),0.6)] bg-black/40"
                  onPointerDown={onPointerDown}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onWheel={onWheel}
                >
                  <img
                    ref={imgRef}
                    src={src}
                    alt="Crop"
                    draggable={false}
                    style={{
                      transform: `translate(${pos.x}px, ${pos.y}px) scale(${scale})`,
                      transformOrigin: "top left",
                      userSelect: "none",
                      position: "absolute",
                      left: 0,
                      top: 0,
                    }}
                  />
                  <div className="pointer-events-none absolute inset-0 rounded-2xl ring-1 ring-white/15">
                    <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                      {Array.from({ length: 9 }).map((_, i) => (
                        <div key={i} className="border-[0.5px] border-white/10" />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <label className="text-sm font-medium">Zoom</label>
                  <input
                    type="range"
                    min={minScale}
                    max={4}
                    step={0.01}
                    value={scale}
                    onChange={(e) => {
                      setScale(Number(e.target.value));
                      setPos((p) => clampPan(p.x, p.y));
                    }}
                    className="w-full"
                  />
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => {
                      if (!natural) return;
                      const v = 360;
                      const s = Math.max(v / natural.w, v / natural.h);
                      setMinScale(s);
                      setScale(s * 1.05);
                      setPos({ x: 0, y: 0 });
                    }}
                  >
                    Reset
                  </button>
                </div>
                <div className="mt-6 flex items-center justify-end gap-3">
                  <button type="button" className="btn btn-ghost" onClick={onCancel}>
                    Cancel
                  </button>
                  <button type="button" className="btn btn-primary" onClick={doSave}>
                    Save avatar
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
