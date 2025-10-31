import { useQuery } from "@tanstack/react-query";

export type ChatReplyRequest = {
  message: string;
};

export type ChatCitation = {
  title: string;
  url: string;
};

export type ChatReplyResponse = {
  role: "assistant";
  content: string;
  citations: ChatCitation[];
};

export type CapabilityProject = {
  id: string;
  name: string;
  status: string;
};

export type Capabilities = {
  auditTrail: boolean;
  encryptionExport: boolean;
  projects: CapabilityProject[];
};

const CAPABILITY_DEFAULTS: Capabilities = {
  auditTrail: true,
  encryptionExport: true,
  projects: []
};

export async function apiPost<TBody extends Record<string, unknown>, TResponse>(
  path: string,
  body: TBody
): Promise<TResponse> {
  if (path === "/chat/reply") {
    return new Promise((resolve) => {
      setTimeout(() => {
        const message = (body as ChatReplyRequest).message;
        resolve({
          role: "assistant",
          content: `I processed your request: ${message}. Here are actionable next steps.`,
          citations: [
            { title: "Nexus Knowledge Base", url: "https://nexus.example/library" },
            { title: "Independent Review", url: "https://nexus.example/audit" }
          ]
        } as TResponse);
      }, 600);
    });
  }

  throw new Error(`Unhandled API path: ${path}`);
}

const sanitizeProjects = (input: unknown): CapabilityProject[] => {
  if (!Array.isArray(input)) return CAPABILITY_DEFAULTS.projects;
  return input
    .map((item) => {
      if (!item || typeof item !== "object") return undefined;
      const { id, name, status } = item as Record<string, unknown>;
      if (typeof id !== "string" || typeof name !== "string") return undefined;
      return {
        id,
        name,
        status: typeof status === "string" ? status : ""
      } satisfies CapabilityProject;
    })
    .filter(Boolean) as CapabilityProject[];
};

export async function fetchCapabilities(): Promise<Capabilities> {
  try {
    const response = await fetch("/api/system/capabilities", {
      headers: {
        Accept: "application/json"
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to load capabilities: ${response.status}`);
    }
    const data = (await response.json()) as Partial<Capabilities> & {
      projects?: unknown;
    };
    return {
      auditTrail: typeof data.auditTrail === "boolean" ? data.auditTrail : CAPABILITY_DEFAULTS.auditTrail,
      encryptionExport:
        typeof data.encryptionExport === "boolean" ? data.encryptionExport : CAPABILITY_DEFAULTS.encryptionExport,
      projects: sanitizeProjects(data.projects)
    };
  } catch (error) {
    console.warn("Falling back to default capabilities", error);
    return CAPABILITY_DEFAULTS;
  }
}

export function useCapabilities() {
  return useQuery({
    queryKey: ["system", "capabilities"],
    queryFn: fetchCapabilities,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });
}
