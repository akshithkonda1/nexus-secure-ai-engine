import { Suspense, useMemo } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/ui/components/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/components/card";

const tabs = [
  { value: "appearance", label: "Appearance" },
  { value: "billing", label: "Billing" }
];

export default function SettingsLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const activeTab = useMemo(() => {
    if (location.pathname.endsWith("/billing")) return "billing";
    return "appearance";
  }, [location.pathname]);

  return (
    <section className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">Settings</h1>
        <p className="text-muted">Personalize Nexus.ai to match your focus.</p>
      </header>
      <Tabs value={activeTab} onValueChange={(value) => navigate(`/settings/${value}`)}>
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="px-4">
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        <TabsContent value={activeTab} className="border-none bg-transparent p-0 shadow-none">
          <Suspense
            fallback={
              <Card>
                <CardHeader>
                  <CardTitle>Loading settings…</CardTitle>
                </CardHeader>
                <CardContent className="text-muted">We’re preparing your controls.</CardContent>
              </Card>
            }
          >
            <Outlet />
          </Suspense>
        </TabsContent>
      </Tabs>
    </section>
  );
}
