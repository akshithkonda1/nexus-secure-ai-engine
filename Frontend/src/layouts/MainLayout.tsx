import React from "react";

import { ProjectProvider } from "@/features/projects/ProjectProvider";
import RootLayout from "@/layouts/RootLayout";

const MainLayout: React.FC = () => {
  return (
    <ProjectProvider>
      <RootLayout />
    </ProjectProvider>
  );
};

export default MainLayout;
