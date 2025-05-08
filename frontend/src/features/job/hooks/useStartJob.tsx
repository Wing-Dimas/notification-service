import { useState } from "react";
import api from "../../../api";
import { toast } from "react-hot-toast";
import useGetJob from "./useGetJob";

const useStartJob = () => {
  const [loading, setLoading] = useState(false);
  const { refetch } = useGetJob();

  const startJob = async (name: string) => {
    setLoading(true);
    try {
      await api.put(`/job/start`, { name: name });

      await refetch();
    } catch (error) {
      console.log(error);
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

  return { loading, startJob };
};

export default useStartJob;
