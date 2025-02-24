import RoutesGenerator from "./routes/RoutesGenerator";
import { routes } from "./routes/routes";

function App() {
  return <RoutesGenerator routes={routes} />;
}

export default App;
