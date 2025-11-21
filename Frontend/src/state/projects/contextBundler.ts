import { Thread } from "@/types/projects";

export const buildProjectContext = (thread: Thread) => {
  return {
    context: thread.messages,
  };
};
