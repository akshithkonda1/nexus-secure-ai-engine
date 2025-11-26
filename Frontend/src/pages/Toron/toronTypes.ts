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

export interface DecisionStep {
  action: string;
  params: Record<string, unknown>;
  index: number;
}

export interface DecisionBlock {
  id: string;
  plan_name: string;
  steps: DecisionStep[];
  risk: string;
  reversible: boolean;
  created_at: string;
  model_votes: Record<string, unknown>;
  user_instructions?: string | null;
}

export interface MicroAgentResult {
  status: string;
  action: string;
  index: number;
  result?: Record<string, unknown>;
  error?: string;
}
