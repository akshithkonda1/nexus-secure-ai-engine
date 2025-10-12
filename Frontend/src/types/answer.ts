export type Answer = {
  id: string;
  text: string;
  models: number;
  sources: { title: string; url: string }[];
  ms: number;
  confidence: number;
  verified: boolean;
};
