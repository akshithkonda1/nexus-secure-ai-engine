import React from "react";

export default function NotFoundPage() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
      <h2 className="text-2xl font-semibold">Page not found</h2>
      <p className="text-muted-foreground">The page you are looking for was moved or never existed.</p>
    </div>
  );
}
