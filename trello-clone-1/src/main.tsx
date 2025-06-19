import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ProjectBoardProvider } from "./contexts/ProjectBoardContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ProjectBoardProvider>
      <App />
    </ProjectBoardProvider>
  </StrictMode>
);
