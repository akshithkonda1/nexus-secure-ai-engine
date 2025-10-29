import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const projects = [
  {
    id: "proj-risk",
    name: "Risk committee briefing",
    status: "In review",
    description: "Aggregates business mode transcripts into a weekly summary for executives.",
  },
  {
    id: "proj-stem",
    name: "STEM lab mentor",
    status: "Building",
    description: "Pairs student agents with lab instrumentation for contextual help.",
  },
  {
    id: "proj-compliance",
    name: "Compliance evidence pack",
    status: "Planning",
    description: "Generates audit-ready change logs with human approvals in loop.",
  },
];

export function ProjectsPane(): JSX.Element {
  return (
    <div className="space-y-4">
      {projects.map((project) => (
        <Card key={project.id}>
          <CardHeader>
            <CardTitle className="text-base">{project.name}</CardTitle>
            <CardDescription>{project.status}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted">{project.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
