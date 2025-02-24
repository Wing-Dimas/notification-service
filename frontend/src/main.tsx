import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthContextProvider } from "./contexts/AuthContext.tsx";
import { SocketContexProvider } from "./contexts/SocketContect.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthContextProvider>
      <SocketContexProvider>
        <App />
      </SocketContexProvider>
    </AuthContextProvider>
  </StrictMode>
);
