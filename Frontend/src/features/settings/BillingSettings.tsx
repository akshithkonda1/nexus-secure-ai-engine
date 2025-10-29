import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const invoices = [
  { id: "INV-2041", date: "2025-01-12", amount: "$99.00", status: "Paid" },
  { id: "INV-1984", date: "2024-12-12", amount: "$99.00", status: "Paid" },
  { id: "INV-1920", date: "2024-11-12", amount: "$99.00", status: "Paid" },
];

export function BillingSettings(): JSX.Element {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold">Billing</h1>
        <p className="text-sm text-muted">Review your current plan, seat allocation, and billing history.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Current plan</CardTitle>
          <CardDescription>Manage how Nexus scales across your team.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold">Pro — Annual</p>
            <p className="text-sm text-muted">Educator-verified plan with 4 seats active, billing cycle renews Feb 12.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Downgrade</Button>
            <Button>Upgrade add-ons</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment method</CardTitle>
          <CardDescription>All charges are routed through our encrypted billing providers.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">Visa ending in 4242</p>
            <p className="text-xs text-muted">Next automatic payment on Feb 12</p>
          </div>
          <Button variant="ghost">Update card</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invoices</CardTitle>
          <CardDescription>Export a ledger-friendly summary whenever finance needs it.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="rounded-lg border border-subtle p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{invoice.id}</p>
                    <p className="text-xs text-muted">{invoice.date}</p>
                  </div>
                  <div className="text-sm font-semibold">{invoice.amount}</div>
                  <span className="rounded-full bg-[var(--app-muted)] px-3 py-1 text-xs font-semibold uppercase text-muted">
                    {invoice.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <Separator className="my-4" />
          <Button variant="outline">Download statement CSV</Button>
        </CardContent>
      </Card>
    </div>
  );
}
