import { useState } from "react";
import api from "../../../api";
import { toast } from "react-hot-toast";

const useEditMessageWA = () => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const editMessageWA = async (id: number, data: FormData) => {
    setLoading(true);
    setIsError(false);
    try {
      await api.put(`/whatsapp/message/${id}/edit`, data);
      toast.success("Sukses edit data");
    } catch (error) {
      if (error) {
        toast.error((error as { message: string; code: number })?.message || "occured error");
      }
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return { isError, loading, editMessageWA };
};

export default useEditMessageWA;
