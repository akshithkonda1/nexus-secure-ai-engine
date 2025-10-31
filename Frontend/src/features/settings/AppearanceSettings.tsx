import { useTheme } from "@/shared/ui/theme/ThemeProvider";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { ModeToggle } from "@/features/mode/ModeToggle";
import { ThemeToggle } from "@/features/theme/ThemeToggle";

export default function AppearanceSettings() {
  const { theme, mode } = useTheme();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Switch between light and dark modes. We follow system defaults when possible.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium">Current theme</p>
            <p className="text-sm text-muted">{theme === "light" ? "Light" : "Dark"}</p>
          </div>
          <ThemeToggle />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workspace mode</CardTitle>
          <CardDescription>Student, Business, or NexusOS — each adjusts accent hues and focus areas.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <ModeToggle />
          <p className="text-sm text-muted">Active mode: {mode}</p>
        </CardContent>
      </Card>
    </div>
  );
}
