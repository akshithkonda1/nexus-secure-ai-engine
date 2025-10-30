import { useMemo } from "react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useUIStore, type LibraryItem } from "@/shared/state/ui";

type LibraryEntry = LibraryItem;

const starterPacks: LibraryEntry[] = [
  {
    id: "starter-astronomy",
    title: "Astronomy debate pack",
    createdAt: new Date().toISOString(),
    summary: "Student mode agents explain stellar evolution with visuals and analogies.",
  },
  {
    id: "starter-ethics",
    title: "Ethics board brief",
    createdAt: new Date().toISOString(),
    summary: "Business mode triages ethical risk scenarios for AI deployments.",
  },
];

export function LibraryPane(): JSX.Element {
  const items = useUIStore((state) => state.libraryItems);
  const data = useMemo<LibraryEntry[]>(() => {
    if (items.length === 0) {
      return starterPacks;
    }
    return [...items, ...starterPacks].reduce<LibraryEntry[]>((unique, item) => {
      if (!unique.some((existing) => existing.id === item.id)) {
        unique.push(item);
      }
      return unique;
    }, []);
  }, [items]);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Library</h2>
        <p className="text-sm text-muted">Curated study packs and assets from your agents.</p>
      </div>
      {data.map((pack) => (
        <Card key={pack.id} className="round-card shadow-ambient">
          <CardHeader>
            <CardTitle className="text-base">{pack.title}</CardTitle>
            <CardDescription>{new Date(pack.createdAt).toLocaleString()}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">{pack.summary}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
