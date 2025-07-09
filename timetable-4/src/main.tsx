import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { TimetableProvider } from "./Contexts/TimetableProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TimetableProvider>
      <App />
    </TimetableProvider>
  </StrictMode>
);
