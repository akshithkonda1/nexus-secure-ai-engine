export interface ToronMessage {
  id: string;
  sender: "user" | "toron";
  text: string;
  timestamp: number;
  tokens?: number;
}

export interface ToronProject {
  id: string;
  name: string;
  summary?: string;
  messages: ToronMessage[];
}
