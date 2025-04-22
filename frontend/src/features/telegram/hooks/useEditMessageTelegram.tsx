import { useState } from "react";
import api from "../../../api";

const useEditMessageTelegram = () => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const editMessageTelegram = async (id: number, data: FormData) => {
    setLoading(true);
    setIsError(false);
    try {
      await api.put(`/telegram/message/${id}/edit`, data);
    } catch (error) {
      setIsError(true);
      throw new Error(
        (error as { message: string; code: number })?.message ||
          "occured error",
      );
    } finally {
      setLoading(false);
    }
  };

  return { isError, loading, editMessageTelegram };
};

export default useEditMessageTelegram;
