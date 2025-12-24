import { Folder } from 'lucide-react';

export default function ProjectsView() {
  return (
    <div className="flex h-full flex-col items-center justify-center px-8 py-12 text-center">
      <Folder className="h-12 w-12 text-[var(--text-muted)] opacity-50" />
      <h3 className="mt-4 text-[14px] font-medium text-[var(--text)]">No projects yet</h3>
      <p className="mt-1 text-[12px] text-[var(--text-muted)]">
        Create a project for deeper context and collaboration
      </p>
    </div>
  );
}
