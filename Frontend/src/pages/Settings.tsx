import React from "react";

export function Settings() {
  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="grid gap-5 lg:grid-cols-3">
        <div className="card p-5">
          <h3 className="font-semibold">Workspace</h3>
          <p className="mt-1 text-sm opacity-75">Name, slug, region</p>
          <button className="mt-3 rounded-xl border border-[rgba(var(--border),0.6)] px-3 py-1.5">Edit</button>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Security</h3>
          <p className="mt-1 text-sm opacity-75">Retention, export, SSO</p>
          <button className="mt-3 rounded-xl border border-[rgba(var(--border),0.6)] px-3 py-1.5">Manage</button>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold">Billing</h3>
          <p className="mt-1 text-sm opacity-75">Plan & usage</p>
          <button className="mt-3 rounded-xl border border-[rgba(var(--border),0.6)] px-3 py-1.5">Open portal</button>
        </div>
      </div>
    </div>
  );
}

export default Settings;
