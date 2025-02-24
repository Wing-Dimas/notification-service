import { lazy } from "react";
import { TRoute } from "../types/rotues";

import DashboardPage from "../features/dashboard/pages/DashbodrdPage";
// const ProtectedResourcePage = lazy(() => import("@/pages/ProtectedResourcePage"));

// import ScanPage from "../features/create-session/pages/ScanPage";
const ScanPage = lazy(() => import("../features/create-session/pages/ScanPage"));
const LoginPage = lazy(() => import("../features/user/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/user/pages/RegisterPage"));

const NotFoundPage = lazy(() => import("../features/errors/pages/NotFoundPage"));

export const routes: TRoute[] = [
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  {
    path: "/dashboard",
    element: <DashboardPage />,
    needAuthentication: true,
    routes: [
      {
        path: "scan",
        element: <ScanPage />,
        needAuthentication: true,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
];
