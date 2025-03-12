import { useState } from "react";
import api from "../../../api";

const useDeleteMessageWA = () => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const deleteMessageWA = async (id: number) => {
    setLoading(true);
    setIsError(false);

    try {
      await api.delete(`/whatsapp/message/${id}`);
    } catch (error) {
      if (error) {
        throw new Error((error as { message: string; code: number })?.message || "occured error");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return { isError, loading, deleteMessageWA };
};

export default useDeleteMessageWA;
