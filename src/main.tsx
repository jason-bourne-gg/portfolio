import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, useRouter } from "./lib/router";
import ClassicApp from "./App.tsx";
import TraceApp from "./v2/TraceApp";
import V2App from "./v2/V2App";
import "./index.css";

/**
 * v2 owns the root. The trace explorer keeps /trace and its /span/* deep
 * links, and v1 stays reachable, unchanged, at /classic.
 */
function Routes() {
  const { path } = useRouter();
  if (path === "/classic") return <ClassicApp />;
  if (path === "/trace" || path.startsWith("/span/")) return <TraceApp />;
  return <V2App />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider>
      <Routes />
    </RouterProvider>
  </StrictMode>
);
