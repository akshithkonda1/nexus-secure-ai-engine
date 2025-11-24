export type Sentiment = "positive" | "neutral" | "negative";

export type Category = "bug" | "feature" | "ui" | "performance" | "other";

export type Priority = number;

export interface FeedbackResponse {
  sentiment: Sentiment;
  category: Category;
  priority: Priority;
  message?: string;
}
