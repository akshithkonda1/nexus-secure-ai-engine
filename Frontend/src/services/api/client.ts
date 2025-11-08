export type Capabilities = { imageGen:boolean; codeGen:boolean; studyPacks:boolean; modelCompare:boolean; exportAudit:boolean; exportEncryption:boolean; };
export async function fetchCapabilities(): Promise<Capabilities> {
  try { const res = await fetch("/api/system/capabilities"); if (!res.ok) throw 0; return await res.json(); }
  catch { return { imageGen:true, codeGen:true, studyPacks:true, modelCompare:true, exportAudit:true, exportEncryption:true }; }
}
