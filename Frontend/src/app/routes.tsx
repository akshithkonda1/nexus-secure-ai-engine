import React from "react";
import { createBrowserRouter } from "react-router-dom";
import AppShell from "./AppShell";
import WelcomeHub from "@/features/hub/WelcomeHub";
import PricingPage from "@/features/pricing/PricingPage";
import AuthPage from "@/features/auth/AuthPage";

function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-semibold">{title}</h1>
      {description ? (
        <p className="text-neutral-600 dark:text-neutral-300">{description}</p>
      ) : null}
    </div>
  );
}

const ChatPage = () => (
  <PlaceholderPage
    title="Chat"
    description="Start a conversation to explore intelligent workflows."
  />
);

const ProjectsPage = () => (
  <PlaceholderPage
    title="Projects"
    description="Organize briefs, research, and deliverables for your teams."
  />
);

const ProjectDetailsPage = () => (
  <PlaceholderPage
    title="Project overview"
    description="Select a project to review context, documents, and activity."
  />
);

const LibraryPage = () => (
  <PlaceholderPage
    title="Library"
    description="Manage knowledge assets, models, and data sources."
  />
);

const SystemPage = () => (
  <PlaceholderPage
    title="System"
    description="Configure infrastructure, integrations, and automations."
  />
);

const SettingsPage = () => (
  <PlaceholderPage
    title="Settings"
    description="Adjust workspace preferences, members, and billing."
  />
);

export const router = createBrowserRouter([
  {
    element: <AppShell />,
    children: [
      { path: "/", element: <WelcomeHub /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/auth", element: <AuthPage /> },
      { path: "/chat", element: <ChatPage /> },
      { path: "/projects", element: <ProjectsPage /> },
      { path: "/projects/:projectId", element: <ProjectDetailsPage /> },
      { path: "/library", element: <LibraryPage /> },
      { path: "/system", element: <SystemPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "*", element: <div className="p-6">Not found</div> },
    ],
  },
]);
