import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function NotFound(): JSX.Element {
  return (
    <div className="flex flex-1 items-center justify-center bg-app p-10">
      <div className="max-w-lg text-center">
        <p className="text-sm font-semibold text-muted">404 — Signal not found</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">The Nexus corridor you entered doesn&apos;t exist.</h1>
        <p className="mt-3 text-muted">
          Double-check the URL or return to your workspace to continue orchestrating your AI teams.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild>
            <Link to="/">Back to chats</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/pricing">View pricing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
