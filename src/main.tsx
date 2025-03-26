import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import AnnotationAnalysisApp from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AnnotationAnalysisApp />
  </StrictMode>
);
