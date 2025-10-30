import { FormEvent, useMemo, useState } from "react";
import { nanoid } from "nanoid";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { logEvent } from "@/shared/lib/audit";

interface Project {
  id: string;
  name: string;
  description: string;
  createdAt: string;
}

const STORAGE_KEY = "nexus.projects";

function loadProjects(): Project[] {
  if (typeof window === "undefined") {
    return [];
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }
    const parsed = JSON.parse(raw) as Project[];
    if (!Array.isArray(parsed)) {
      return [];
    }
    return parsed;
  } catch (error) {
    console.warn("Failed to load projects", error);
    return [];
  }
}

function persist(projects: Project[]) {
  if (typeof window === "undefined") {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

export function ProjectsPane(): JSX.Element {
  const [projects, setProjects] = useState<Project[]>(() => loadProjects());
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const ordered = useMemo(() => {
    return [...projects].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [projects]);

  const handleCreate = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedDescription = description.trim();
    if (!trimmedName) {
      return;
    }
    const next: Project = {
      id: nanoid(),
      name: trimmedName,
      description: trimmedDescription || "Notes will appear here as your project evolves.",
      createdAt: new Date().toISOString(),
    };
    const updated = [next, ...projects];
    setProjects(updated);
    persist(updated);
    logEvent("project:create", { id: next.id, name: next.name });
    setName("");
    setDescription("");
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Projects</h2>
        <p className="text-sm text-muted">Organize initiatives that combine chats, assets, and reviews.</p>
      </div>
      <Card className="round-card shadow-ambient">
        <CardHeader>
          <CardTitle className="text-base">Create a project</CardTitle>
          <CardDescription>Group related chats, datasets, and outputs into a shared initiative.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="project-name">Project name</Label>
              <Input
                id="project-name"
                className="round-input"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g., Compliance evidence pack"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-description">Summary</Label>
              <textarea
                id="project-description"
                className="min-h-[100px] w-full resize-y round-card border border-subtle/60 px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--mode-accent-solid)]"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Capture the goal, stakeholders, or key deliverables."
              />
            </div>
            <div className="flex justify-end">
              <Button type="submit" className="round-btn shadow-press" disabled={name.trim().length === 0}>
                Create project
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {ordered.length === 0 ? (
          <Card className="round-card shadow-ambient">
            <CardHeader>
              <CardTitle className="text-base">No projects yet</CardTitle>
              <CardDescription>Use projects to organize AI efforts across teams.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          ordered.map((project) => (
            <Card key={project.id} className="round-card shadow-ambient">
              <CardHeader>
                <CardTitle className="text-base">{project.name}</CardTitle>
                <CardDescription>Created {new Date(project.createdAt).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted">{project.description}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
