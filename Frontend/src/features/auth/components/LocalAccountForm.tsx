import { useState, type FormEvent } from "react";
import { cn } from "@/shared/lib/cn";

type Mode = "login" | "register" | "forgot";

interface StatusState {
  type: "idle" | "loading" | "error" | "success";
  message?: string;
}

interface LocalAccountFormProps {
  className?: string;
}

export function LocalAccountForm({ className }: LocalAccountFormProps) {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<StatusState>({ type: "idle" });

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email || (mode !== "forgot" && !password)) {
      return;
    }

    const endpointMap: Record<Mode, string> = {
      login: "/api/auth/login/local",
      register: "/api/auth/local/register",
      forgot: "/api/auth/local/forgot",
    };

    setStatus({ type: "loading" });
    try {
      const response = await fetch(endpointMap[mode], {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(
          mode === "forgot"
            ? { email }
            : {
                email,
                password,
              },
        ),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Unable to complete request");
      }

      if (mode === "login") {
        setStatus({ type: "success", message: "Signed in. Redirecting…" });
        window.location.href = "/";
        return;
      }

      if (mode === "register") {
        setStatus({ type: "success", message: "Account created. You can sign in now." });
        setMode("login");
        setPassword("");
        return;
      }

      setStatus({ type: "success", message: "Password reset instructions sent to your inbox." });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Something went wrong";
      setStatus({ type: "error", message });
    }
  }

  const isLoading = status.type === "loading";
  const showPassword = mode !== "forgot";

  return (
    <form className={cn("space-y-5", className)} onSubmit={submit} noValidate>
      <div className="space-y-2 text-left">
        <label htmlFor="local-email" className="text-sm font-medium text-muted-foreground">
          Email address
        </label>
        <input
          id="local-email"
          type="email"
          autoComplete="email"
          required
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      {showPassword ? (
        <div className="space-y-2 text-left">
          <label htmlFor="local-password" className="text-sm font-medium text-muted-foreground">
            Password
          </label>
          <input
            id="local-password"
            type="password"
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            required
            className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        {mode !== "login" ? (
          <button
            type="button"
            className="font-medium hover:underline"
            onClick={() => {
              setMode("login");
              setStatus({ type: "idle" });
            }}
          >
            Back to sign in
          </button>
        ) : (
          <button
            type="button"
            className="font-medium hover:underline"
            onClick={() => {
              setMode("forgot");
              setStatus({ type: "idle" });
            }}
          >
            Forgot password?
          </button>
        )}

        {mode === "login" ? (
          <button
            type="button"
            className="font-medium hover:underline"
            onClick={() => {
              setMode("register");
              setStatus({ type: "idle" });
            }}
          >
            Create account
          </button>
        ) : null}
      </div>

      {status.message ? (
        <p
          className={cn(
            "text-sm",
            status.type === "error"
              ? "text-destructive"
              : status.type === "success"
                ? "text-emerald-500"
                : "text-muted-foreground",
          )}
        >
          {status.message}
        </p>
      ) : null}

      <button
        type="submit"
        className="w-full rounded-xl bg-gradient-to-r from-accent via-accent/90 to-primary px-4 py-3 text-sm font-semibold text-[rgb(var(--on-accent))] shadow-lg shadow-accent/30 transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
        disabled={
          isLoading ||
          !email ||
          (showPassword && !password)
        }
      >
        {isLoading ? "Processing…" : mode === "login" ? "Continue" : mode === "register" ? "Create account" : "Send reset link"}
      </button>
    </form>
  );
}
