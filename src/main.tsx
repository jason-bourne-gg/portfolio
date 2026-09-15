import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, useRouter } from "./lib/router";

/**
 * v1 owns the site. The later experiments stay reachable behind /beta, and
 * every version is loaded on demand so none of them can drag in another's
 * stylesheet or bundle.
 */
const ClassicApp = lazy(() => import("./App"));
const V2App = lazy(() => import("./v2/V2App"));
const TraceApp = lazy(() => import("./v2/TraceApp"));
const BetaApp = lazy(() => import("./site/App"));

function Routes() {
  const { path } = useRouter();
  if (path === "/beta" || path === "/beta/world") return <BetaApp />;
  if (path === "/beta/v2") return <V2App />;
  if (path === "/trace" || path.startsWith("/span/")) return <TraceApp />;
  return <ClassicApp />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider>
      <Suspense fallback={<div style={{ position: "fixed", inset: 0, background: "#0b0c0f" }} />}>
        <Routes />
      </Suspense>
    </RouterProvider>
  </StrictMode>
);
