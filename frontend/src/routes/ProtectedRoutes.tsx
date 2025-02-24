// import { useAuth } from "@/hooks/useAuth";
// import { parseJwt } from "@/utils/tokenUtils";
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuthContext } from "../contexts/AuthContext";

export type Props = {
  needAuthentication: boolean;
  component: React.ReactNode; //JSX.Element
};

const ProtectedRoute = ({ needAuthentication, component: Component }: Props) => {
  const { authUser } = useAuthContext();

  // const accessToken = authUser?.accessToken ?? null;

  // if (!accessToken) return <Navigate to="/" />;

  // if (needAuthentication && parseJwt(accessToken).isExpired)
  //     return <Navigate to="/" />;

  if (needAuthentication && !authUser) return <Navigate to="/" />;

  return Component;
};

export default ProtectedRoute;
