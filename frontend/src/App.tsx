import { Toaster } from "react-hot-toast";
import RoutesGenerator from "./routes/RoutesGenerator";
import { routes } from "./routes/routes";
import { useEffect } from "react";
import useGetStatusWA from "./features/create-session/hooks/useGetStatusWA";
import { useAuthContext } from "./contexts/AuthContext";

function App() {
  const { getStatusWA } = useGetStatusWA();
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      getStatusWA();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  return (
    <>
      <RoutesGenerator routes={routes} />
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
