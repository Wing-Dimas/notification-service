import { useState } from "react";
import api from "../../../api";

const useEditMessageWA = () => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const editMessageWA = async (id: number, data: FormData) => {
    setLoading(true);
    setIsError(false);
    try {
      await api.put(`/whatsapp/message/${id}/edit`, data);
    } catch (error) {
      setIsError(true);
      throw new Error((error as { message: string; code: number })?.message || "occured error");
    } finally {
      setLoading(false);
    }
  };

  return { isError, loading, editMessageWA };
};

export default useEditMessageWA;
