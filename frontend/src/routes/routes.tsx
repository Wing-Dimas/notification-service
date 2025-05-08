import { lazy } from "react";
import { TRoute } from "../types/rotues";

import DashboardPage from "../features/dashboard/pages/DashbodrdPage";

const ScanPage = lazy(
  () => import("../features/create-session/pages/ScanPage"),
);
const LoginPage = lazy(() => import("../features/user/pages/LoginPage"));
const RegisterPage = lazy(() => import("../features/user/pages/RegisterPage"));
const NotFoundPage = lazy(
  () => import("../features/errors/pages/NotFoundPage"),
);
const WhatsappPage = lazy(
  () => import("../features/whatsapp/page/WhatsappPage"),
);
const TelegramPage = lazy(
  () => import("../features/telegram/page/TelegramPage"),
);
const ApiKeyPage = lazy(() => import("../features/api-key/page/ApiKeyPage"));
const JobPage = lazy(() => import("../features/job/page/JobPage"));

export const routes: TRoute[] = [
  // START USER
  {
    path: "/",
    element: <LoginPage />,
  },
  {
    path: "/register",
    element: <RegisterPage />,
  },
  //   END USER
  //   START DASHABORD
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
      //   START WHATSAPP
      {
        path: "whatsapp",
        element: <WhatsappPage />,
        needAuthentication: true,
      },
      //   END WHATSAPP
      //   START TELEGRAM
      {
        path: "telegram",
        element: <TelegramPage />,
        needAuthentication: true,
      },
      //   END TELEGRAM
      //   START API KEY MANAGEMENT
      {
        path: "api-key",
        element: <ApiKeyPage />,
        needAuthentication: true,
      },
      //   END API KEY MANAGEMENT
      //   START Job MANAGEMENT
      {
        path: "job-management",
        element: <JobPage />,
        needAuthentication: true,
      },
      //   END Job MANAGEMENT
    ],
  },
  //   END DASHBOARD
  //   START NOT FOUND
  {
    path: "*",
    element: <NotFoundPage />,
  },
  //   END NOT FOUND
];
