import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const models = [
  { id: "omniscience", name: "Omniscience 3.2", latency: "180ms", status: "Consensus anchor" },
  { id: "dialectic", name: "Dialectic Duo", latency: "220ms", status: "Debate pair" },
  { id: "scribe", name: "Scribe Memory", latency: "95ms", status: "Ground truth summarizer" },
];

export function ModelsPane(): JSX.Element {
  return (
    <div className="space-y-4">
      {models.map((model) => (
        <Card key={model.id}>
          <CardHeader>
            <CardTitle className="text-base">{model.name}</CardTitle>
            <CardDescription>{model.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">Median latency {model.latency}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
