import { RouteProps } from "react-router-dom";

export type TRoute = RouteProps & {
  needAuthentication?: boolean;
  routes?: TRoute[];
  // React.ReactElement
};

export type TRouteLink = { name: string; href: string };
