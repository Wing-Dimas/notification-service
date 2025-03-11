import { useState } from "react";
import api from "../../../api";

const useSendMessageWA = () => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const sendMessageWA = async (id: number) => {
    setLoading(true);
    setIsError(false);

    try {
      await api.post(`/whatsapp/message/${id}/send-message`);
    } catch (error) {
      if (error) {
        throw new Error((error as { message: string; code: number })?.message || "occured error");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return { isError, loading, sendMessageWA };
};

export default useSendMessageWA;
