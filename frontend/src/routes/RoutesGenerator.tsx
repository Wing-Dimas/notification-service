import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TRoute } from "../types/rotues";
import ProtectedRoute from "./ProtectedRoutes";
import { randomKey } from "../libs/utils";

const RoutesGenerator = ({ routes }: { routes: TRoute[] }) => {
  return (
    <BrowserRouter>
      <Routes>{NestedRoutes(routes)}</Routes>
    </BrowserRouter>
  );
};

const NestedRoutes = (routes: TRoute[], parentPath = "") => {
  return (
    <>
      {routes.map((route, indx) => {
        const { path = "", routes: nestedRoutes } = route;
        const fullPath = `${parentPath}${path}`;
        if (nestedRoutes) {
          return (
            <Route key={randomKey()} path={`${path}`}>
              <Route
                index
                key={randomKey()}
                // element={Component}
                element={<RouteElement {...route} />}
              />
              {NestedRoutes(nestedRoutes, fullPath)}
            </Route>
          );
        }

        return <Route index={indx === 0} key={randomKey()} path={path} element={<RouteElement {...route} />} />;
      })}
    </>
  );
};

const RouteElement = (route: TRoute) => {
  const { element: Component, needAuthentication } = route;

  return (
    <>
      {needAuthentication ? (
        <ProtectedRoute needAuthentication={needAuthentication} component={Component} />
      ) : (
        Component
      )}
    </>
  );
};

export default RoutesGenerator;
