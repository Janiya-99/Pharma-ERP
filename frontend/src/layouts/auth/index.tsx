import { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import routes from "routes";
import type { ERPRoute } from "routes";
import LoadingScreen from "components/common/LoadingScreen";

export default function Auth() {
  const getRoutes = (routes: ERPRoute[]): any => {
    return routes.map((prop: unknown, key: unknown) => {
      if (prop.layout === "/auth") {
        return (
          <Route path={`/${prop.path}`} element={prop.component} key={key} />
        );
      } else {
        return null;
      }
    });
  };

  document.documentElement.dir = "ltr";

  return (
    <div className="relative flex min-h-screen w-full font-fira font-sans">
      {/* Full-screen split layout */}
      <Suspense fallback={<LoadingScreen mode="page" />}>
        <Routes>
          {getRoutes(routes)}
          <Route path="/" element={<Navigate to="/auth/sign-in" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}
