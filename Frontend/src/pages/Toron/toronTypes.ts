export type PersonaMode = "fitness" | "anime" | "journal" | "engineering" | "default";

export interface ToronMessage {
  id: string;
  sender: "user" | "toron";
  text: string;
  timestamp: number;
  tokens?: number;
  attachments?: string[];
}

export interface ToronMemory {
  shortTerm: string[];
  longTerm: string[];
}

export interface ToronProjectMetadata {
  goals?: string;
  personaMode?: PersonaMode;
  keywords?: string[];
}

export interface ToronProject {
  id: string;
  name: string;
  messages: ToronMessage[];
  metadata: ToronProjectMetadata;
  memory: ToronMemory;
  updatedAt?: number;
}
