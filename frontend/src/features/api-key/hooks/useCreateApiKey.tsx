import { useState } from "react";
import api from "../../../api";
import { IApiKeyCreate } from "../../../types/api-key";

const useCreateApiKey = () => {
  const [loading, setLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const createApiKey = async (data: IApiKeyCreate) => {
    setLoading(true);
    setIsError(false);
    try {
      await api.post(`/api-key`, data);
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

  return { isError, loading, createApiKey };
};

export default useCreateApiKey;
