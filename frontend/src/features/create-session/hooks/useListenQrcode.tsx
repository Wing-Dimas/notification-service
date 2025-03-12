import { useEffect, useState } from "react";

// import notificationSound from "../assets/sounds/notification.mp3";
import { useSocketContext } from "../../../contexts/SocketContext";
import toast from "react-hot-toast";

const useListenQrcode = () => {
  const { socket } = useSocketContext();
  const [qrcode, setQrcode] = useState<string | null>();
  const [logger, setLogger] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    socket?.on("connection-status", (event) => {
      if (event) {
        toast.success(event.result);
      }
    });

    socket?.on("update-qr", (event) => {
      console.log(event);
      if (event.buffer) {
        setQrcode(`data:image/png;base64,${event.buffer}`);
      } else {
        setQrcode(null);
        toast.error("Connection timeout, Please create session again!!!");
      }
    });

    socket?.on("logger", (event) => {
      const elements = event;
      setLogger(elements.status);
    });

    socket?.on(`session-status`, (event) => {
      setStatus(event.result);
    });

    return () => {
      socket?.off("connection-status");
      socket?.off("update-qr");
      socket?.off("logger");
      socket?.off("session-status");
    };
  }, [socket]);

  return { qrcode, logger, status };
};

export default useListenQrcode;
