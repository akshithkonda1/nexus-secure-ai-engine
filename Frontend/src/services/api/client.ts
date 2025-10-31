export type Capabilities = {
  imageGen: boolean;
  codeGen: boolean;
  studyPacks: boolean;
  modelCompare: boolean;
  exportAudit: boolean;
  exportEncryption: boolean;
};

export async function fetchCapabilities(): Promise<Capabilities> {
  try {
    const r = await fetch("/api/system/capabilities");
    if (!r.ok) throw new Error("cap");
    return await r.json();
  } catch {
    return {
      imageGen: true,
      codeGen: true,
      studyPacks: true,
      modelCompare: true,
      exportAudit: true,
      exportEncryption: true,
    };
  }
}

export async function chatReply(prompt: string): Promise<string> {
  try {
    const r = await fetch("/api/chat/reply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt }),
    });
    if (!r.ok) throw new Error("chat");
    const data = await r.json();
    return data?.message ?? "…";
  } catch {
    await new Promise((res) => setTimeout(res, 400));
    return "Mock: here's a validated answer with confidence 0.91.";
  }
}
