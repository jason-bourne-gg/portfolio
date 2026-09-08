import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, useRouter } from "./lib/router";
import ClassicApp from "./App.tsx";
import TraceApp from "./v2/TraceApp";
import "./index.css";

/**
 * v2 (the trace explorer) owns the root and the /span/* deep links.
 * v1 stays reachable, unchanged, at /classic.
 */
function Routes() {
  const { path } = useRouter();
  return path === "/classic" ? <ClassicApp /> : <TraceApp />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider>
      <Routes />
    </RouterProvider>
  </StrictMode>
);
