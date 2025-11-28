export type WorkspaceRoute = "flows" | "boards" | "pages" | "vault" | "analyze";

export const workspaceRoutes: { key: WorkspaceRoute; label: string }[] = [
  { key: "flows", label: "Flows" },
  { key: "boards", label: "Boards" },
  { key: "pages", label: "Pages" },
  { key: "vault", label: "Vault" },
  { key: "analyze", label: "Analyze" },
];
