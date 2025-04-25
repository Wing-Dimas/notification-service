import { useState } from "react";
import api from "../../../api";

const useDeleteApiKey = () => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const deleteApiKey = async (id: number) => {
    setLoading(true);
    setIsError(false);

    try {
      await api.delete(`/api-key/${id}`);
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

  return { isError, loading, deleteApiKey };
};

export default useDeleteApiKey;
