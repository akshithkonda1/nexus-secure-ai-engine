import { useEffect, useState } from "react";
import { Button } from "@/shared/ui/components/button";
import { Input } from "@/shared/ui/components/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/ui/components/card";
import { logEvent } from "@/shared/lib/audit";

const STORAGE_KEY = "nexus.projects";

type Project = {
  id: string;
  name: string;
  description: string;
  createdAt: number;
};

const generateId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : Math.random().toString(36).slice(2);

export default function ProjectsPane() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setProjects(JSON.parse(raw) as Project[]);
      }
    } catch (error) {
      console.warn("Failed to load projects", error);
    }
  }, []);

  const persist = (next: Project[]) => {
    setProjects(next);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    const project: Project = {
      id: generateId(),
      name: name.trim(),
      description: description.trim(),
      createdAt: Date.now()
    };
    const next = [project, ...projects];
    persist(next);
    setName("");
    setDescription("");
    logEvent("project.created", { name: project.name });
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="rounded-card border border-app bg-app p-4 shadow-press">
        <div className="grid gap-3 md:grid-cols-2">
          <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Project name" required />
          <Input
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="What are you building?"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <Button type="submit">Create project</Button>
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => (
          <Card key={project.id}>
            <CardHeader>
              <CardTitle>{project.name}</CardTitle>
              <CardDescription>
                Created {new Date(project.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted">{project.description || "No description provided."}</p>
            </CardContent>
          </Card>
        ))}
        {projects.length === 0 && <p className="text-sm text-muted">No projects yet. Create your first blueprint above.</p>}
      </div>
    </div>
  );
}
