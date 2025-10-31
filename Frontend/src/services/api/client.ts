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
