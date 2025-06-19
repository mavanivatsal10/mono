import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { ProjectBoardProvider } from "./contexts/ProjectBoardContext.tsx";
import { BrowserRouter } from "react-router-dom";
import { GlobalProvider } from "./contexts/GlobalContext.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalProvider>
        <ProjectBoardProvider>
          <App />
        </ProjectBoardProvider>
      </GlobalProvider>
    </BrowserRouter>
  </StrictMode>
);
