import { useState } from "react";
import api from "../../../api";
import { IApiKeyUpdate } from "../../../types/api-key";

const useEditApiKey = () => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const editApiKey = async (id: number, data: IApiKeyUpdate) => {
    setLoading(true);
    setIsError(false);
    try {
      await api.put(`/api-key/${id}`, data);
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

  return { isError, loading, editApiKey };
};

export default useEditApiKey;
