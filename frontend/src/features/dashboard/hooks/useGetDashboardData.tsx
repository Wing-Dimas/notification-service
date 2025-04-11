import { useState } from "react";
import api from "../../../api";
import { toast } from "react-hot-toast";
import { IDashboardData } from "../../../types/dashboard";

const useGetDashboardData = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<IDashboardData | null>();

  const getDashboardData = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/get-dashboard-data`);
      const data = res.data as IDashboardData;

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

  return { loading, getDashboardData, data };
};

export default useGetDashboardData;
