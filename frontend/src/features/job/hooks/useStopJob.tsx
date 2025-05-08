import { useState } from "react";
import api from "../../../api";
import { toast } from "react-hot-toast";
import useGetJob from "./useGetJob";

const useStopJob = () => {
  const [loading, setLoading] = useState(false);
  const { refetch } = useGetJob();

  const stopJob = async (name: string) => {
    setLoading(true);
    try {
      await api.put(`/job/stop`, { name: name });

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

  return { loading, stopJob };
};

export default useStopJob;
