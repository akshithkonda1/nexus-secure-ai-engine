import { Route, Routes, useLocation } from "react-router-dom";
import RouteBoundary from "./components/RouteBoundary";
import Documents from "./pages/Documents";
import History from "./pages/History";
import Home from "./pages/Home";
import Projects from "./pages/Projects";
import Settings from "./pages/Settings";
import Toron from "./pages/Toron";
import Workspace from "./pages/Workspace";

function AppRoutes() {
  const location = useLocation();

  return (
    <Routes location={location} key={location.pathname}>
      <Route
        path="/"
        element={
          <RouteBoundary>
            <Home />
          </RouteBoundary>
        }
      />
      <Route
        path="/toron"
        element={
          <RouteBoundary>
            <Toron />
          </RouteBoundary>
        }
      />
      <Route
        path="/workspace"
        element={
          <RouteBoundary>
            <Workspace />
          </RouteBoundary>
        }
      />
      <Route
        path="/projects"
        element={
          <RouteBoundary>
            <Projects />
          </RouteBoundary>
        }
      />
      <Route
        path="/documents"
        element={
          <RouteBoundary>
            <Documents />
          </RouteBoundary>
        }
      />
      <Route
        path="/history"
        element={
          <RouteBoundary>
            <History />
          </RouteBoundary>
        }
      />
      <Route
        path="/settings"
        element={
          <RouteBoundary>
            <Settings />
          </RouteBoundary>
        }
      />
      <Route
        path="*"
        element={
          <RouteBoundary>
            <Home />
          </RouteBoundary>
        }
      />
    </Routes>
  );
}

export default AppRoutes;
