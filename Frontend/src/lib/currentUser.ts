export type CurrentUser = {
  id: string;
  name: string;
  handle: string;
  title?: string;
  avatarUrl?: string | null;
};

export const currentUser: CurrentUser = {
  id: "demo",
  name: "Avery Quinn",
  handle: "@avery",
  title: "Director of AI Programs",
  avatarUrl: null,
};
