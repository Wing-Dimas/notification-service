import api from "../../../api";
import { useState } from "react";
import { toast } from "react-hot-toast";
import useGetJob from "./useGetJob";

const useReloadJob = () => {
  const [loading, setLoading] = useState(false);
  const { refetch } = useGetJob();

  const reloadJob = async (name: string) => {
    setLoading(true);
    try {
      await api.put(`/job/reload`, { name: name });

      await refetch();
    } catch (error) {
      if (error) {
        toast.error(
          (error as { message: string; code: number })?.message ||
            "occured error",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, reloadJob };
};

export default useReloadJob;
