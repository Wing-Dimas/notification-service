import { createContext, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthContext";
import io, { Socket } from "socket.io-client";

type SocketContexType = {
  socket: Socket | null;
  isConnected: boolean;
};

// eslint-disable-next-line react-refresh/only-export-components
export const SocketContex = createContext<SocketContexType>({} as SocketContexType);

// eslint-disable-next-line react-refresh/only-export-components
export const useSocketContext = () => {
  return useContext(SocketContex);
};

interface SocketContexProviderProps {
  children: React.ReactNode;
}

export const SocketContexProvider = ({ children }: SocketContexProviderProps) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { authUser } = useAuthContext();

  useEffect(() => {
    if (authUser) {
      const socket = io(import.meta.env.VITE_SOCKET_URL, {
        query: {
          userId: authUser.id as string,
        },
      });

      setSocket(socket);

      socket.on("getIsConnected", (status) => {
        setIsConnected(status);
      });

      return () => socket.close();
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }

    return () => {
      if (socket) socket.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser]);

  return <SocketContex.Provider value={{ socket, isConnected }}>{children}</SocketContex.Provider>;
};
