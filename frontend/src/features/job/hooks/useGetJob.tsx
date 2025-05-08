import { useState } from "react";
import api from "../../../api";
import { toast } from "react-hot-toast";
import { DataType, useJob } from "../../../zustand/useJob";

const useGetJob = () => {
  const [loading, setLoading] = useState(false);
  const { setData } = useJob();

  const getJob = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/job`);
      const data = res.data as DataType;

      setData(data);
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

  const refetch = async () => getJob();

  return { loading, getJob, refetch };
};

export default useGetJob;
