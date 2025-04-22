import { useState } from "react";
import api from "../../../api";

const useSendMessageTelegram = () => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const sendMessageTelegram = async (id: number) => {
    setLoading(true);
    setIsError(false);

    try {
      await api.post(`/telegram/message/${id}/send-message`);
    } catch (error) {
      if (error) {
        throw new Error(
          (error as { message: string; code: number })?.message ||
            "occured error",
        );
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return { isError, loading, sendMessageTelegram };
};

export default useSendMessageTelegram;
