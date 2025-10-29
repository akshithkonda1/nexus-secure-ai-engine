import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/shared/ui/components/button";
import { Switch } from "@/shared/ui/components/switch";
import { ToastProviderWithToasts } from "@/shared/ui/components/toast";
import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { useUIState } from "@/shared/state/ui";
import { cn } from "@/shared/lib/cn";

const NEW_CHAT_EVENT = "nexus:new-chat";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { theme, setTheme } = useTheme();
  const { openProfile } = useUIState();
  const location = useLocation();
  const navigate = useNavigate();

  const handleThemeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
  };

  const handleNewChat = () => {
    window.dispatchEvent(new CustomEvent(NEW_CHAT_EVENT));
    if (location.pathname !== "/") {
      navigate("/");
    }
  };

  return (
    <ToastProviderWithToasts>
      <div className="bg-background text-foreground">
        <div className="mx-auto flex min-h-screen w-full max-w-[1440px] flex-col md:flex-row">
          <aside className="hidden w-64 border-r border-border bg-background px-6 py-8 md:flex md:flex-col md:gap-8">
            <div>
              <div className="text-xl font-semibold">Nexus.ai</div>
              <p className="text-sm text-muted-foreground">Where AIs debate, verify, and agree on the truth.</p>
            </div>
            <Button className="justify-start" onClick={handleNewChat} aria-label="Start new chat">
              ＋ New chat
            </Button>
            <nav className="flex flex-col gap-2 text-sm" aria-label="Primary">
              <Button
                variant="ghost"
                className="justify-start"
                onClick={openProfile}
                aria-label="Open profile settings"
              >
                Profile
              </Button>
              <Button
                variant="ghost"
                className={cn("justify-start", location.pathname === "/pricing" && "bg-[hsl(var(--muted))]")}
                asChild
                aria-label="View pricing"
              >
                <Link to="/pricing">Pricing</Link>
              </Button>
            </nav>
          </aside>
          <div className="flex min-h-screen flex-1 flex-col">
            <header className="flex items-center justify-between border-b border-border bg-background px-4 py-4 md:px-6">
              <div className="flex flex-col gap-1">
                <h1 className="text-base font-semibold">Nexus.ai — Where AIs debate, verify, and agree on the truth.</h1>
                <p className="text-sm text-muted-foreground">
                  Encrypted. Auditable. Vendor-neutral. Because accuracy deserves proof.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span id="theme-toggle-label" className="text-sm text-muted-foreground">
                  {theme === "dark" ? "Dark" : "Light"} theme
                </span>
                <Switch
                  aria-labelledby="theme-toggle-label"
                  checked={theme === "dark"}
                  onCheckedChange={handleThemeToggle}
                />
              </div>
            </header>
            <main className="flex-1 overflow-y-auto bg-background p-4 md:p-8">{children}</main>
          </div>
        </div>
      </div>
    </ToastProviderWithToasts>
  );
}

export { NEW_CHAT_EVENT };
