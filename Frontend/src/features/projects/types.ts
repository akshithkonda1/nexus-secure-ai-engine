export type ProjectTask = {
  id: string;
  text: string;
  done: boolean;
};

export type ProjectContextState = {
  persona: string;
  reasoningHints: string[];
  continuityScore: number;
  difficultyScore: number;
  topicTags: string[];
};

export type ProjectConnectors = {
  github?: boolean;
  googleDrive?: boolean;
  quizlet?: boolean;
};

export type Project = {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  summary: string;
  semanticGraph: number[][];
  taskList: ProjectTask[];
  connectorsEnabled: ProjectConnectors;
  contextState: ProjectContextState;
  version: number;
};

export type EncryptedProjectPayload = {
  algorithm: "AES-256-GCM";
  iv: string;
  ciphertext: string;
  version: number;
};
