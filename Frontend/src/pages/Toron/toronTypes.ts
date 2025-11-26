export type ToronSender = "user" | "toron";

export interface ToronMessage {
  id: string;
  sender: ToronSender;
  text: string;
  timestamp: number;
}

export interface ToronProject {
  id: string;
  name: string;
}
