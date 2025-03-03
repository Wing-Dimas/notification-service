import { Toaster } from "react-hot-toast";
import RoutesGenerator from "./routes/RoutesGenerator";
import { routes } from "./routes/routes";

function App() {
  return (
    <>
      <RoutesGenerator routes={routes} />;
      <Toaster position="bottom-right" />
    </>
  );
}

export default App;
