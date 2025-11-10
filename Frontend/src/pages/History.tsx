import React from "react";

const rows = [
  { when: "2m", who: "Avery", what: "Ran prompt ‘Roadmap brief’" },
  { when: "1h", who: "Jordan", what: "Uploaded 5 docs" },
  { when: "3h", who: "Avery", what: "Changed retention to 30d" },
];

export function History() {
  return (
    <div className="px-[var(--page-padding)] py-6">
      <div className="card p-5">
        <h2 className="text-lg font-semibold">Activity</h2>
        <table className="mt-4 w-full text-sm">
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-[rgba(var(--border))]">
                <td className="py-3 opacity-60">{r.when}</td>
                <td className="py-3">{r.who}</td>
                <td className="py-3">{r.what}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default History;
