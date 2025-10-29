import { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../shared/ui/card";
import { Button } from "../../shared/ui/button";
import { PRICES } from "../pricing/PricingPage";

const invoices = [
  { id: "INV-2041", amount: "$19.00", date: "Jan 2, 2025", status: "Paid" },
  { id: "INV-1987", amount: "$99.00", date: "Dec 2, 2024", status: "Paid" },
];

export function BillingSettings() {
  const defaultCycle = useMemo(() => {
    const month = new Date().getMonth();
    if (month === 0 || month === 7) {
      return "Semester";
    }
    return "Monthly";
  }, []);

  const [plan] = useState("Premium");
  const [cycle] = useState(defaultCycle);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted">Manage your subscription, invoices, and payment method.</p>
      </header>
      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Your Nexus access level and usage insights.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-lg font-semibold">{plan} plan</div>
            <div className="text-sm text-muted">Billing cycle: {cycle}</div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Downgrade</Button>
            <Button>Upgrade</Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Billing cycle</CardTitle>
          <CardDescription>Pricing values mirror the public pricing page.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 text-sm text-muted">
            <div>Academic Monthly: ${PRICES.academic.monthly.toFixed(2)}</div>
            <div>Academic Annual: ${PRICES.academic.annual.toFixed(0)}</div>
            <div>Academic Semester: ${PRICES.academic.semester.toFixed(0)}</div>
            <div>Premium Monthly: ${PRICES.premium.monthly.toFixed(0)}</div>
            <div>Premium Annual: ${PRICES.premium.annual.toFixed(0)}</div>
            <div>Pro Monthly: ${PRICES.pro.monthly.toFixed(0)}</div>
            <div>Pro Annual: ${PRICES.pro.annual.toFixed(0)}</div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Downloadable invoice history for your auditors.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="flex items-center justify-between rounded-lg border border-subtle bg-surface/60 px-4 py-3">
              <div>
                <div className="text-sm font-medium">{invoice.id}</div>
                <div className="text-xs text-muted">{invoice.date}</div>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span>{invoice.amount}</span>
                <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs text-emerald-400">{invoice.status}</span>
                <Button size="sm" variant="outline">
                  Download
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>Securely stored via encrypted vault.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-subtle bg-surface/60 px-4 py-3">
            <div>
              <div className="text-sm font-medium">Visa ending 4819</div>
              <div className="text-xs text-muted">Expires 06/28 — managed by Nexus Vault</div>
            </div>
            <Button size="sm" variant="outline">
              Update
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
