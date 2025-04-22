import { useState } from "react";
import api from "../../../api";

const useDeleteMessageTelegram = () => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const deleteMessageTelegram = async (id: number) => {
    setLoading(true);
    setIsError(false);

    try {
      await api.delete(`/telegram/message/${id}`);
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

  return { isError, loading, deleteMessageTelegram };
};

export default useDeleteMessageTelegram;
