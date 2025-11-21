export type SanitizedMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: string;
};

export type Thread = {
  id: string;
  title: string;
  messages: SanitizedMessage[];
};

export type Project = {
  id: string;
  name: string;
  createdAt: string;
  threads: Thread[];
};
