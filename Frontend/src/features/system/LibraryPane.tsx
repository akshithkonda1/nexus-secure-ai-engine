import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card";

const studyPacks = [
  {
    id: "biology",
    title: "Neural Biology 301",
    updatedAt: "2 days ago",
    description: "A cross-verified synthesis of synaptic transmission research."
  },
  {
    id: "ethics",
    title: "AI Ethics and Governance",
    updatedAt: "5 days ago",
    description: "Ground truths on alignment frameworks, policy briefings, and citations."
  }
];

export default function LibraryPane() {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {studyPacks.map((pack) => (
        <Card key={pack.id}>
          <CardHeader>
            <CardTitle>{pack.title}</CardTitle>
            <CardDescription>Last updated {pack.updatedAt}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-app">{pack.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
