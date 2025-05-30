import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App2 from "./App2.tsx";
import "./index.css";
import App from "./App.tsx";
import Nav from "./Nav.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
      <Nav />
  </StrictMode>
);
