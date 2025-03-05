import { useState } from "react";
import api from "../../../api";
import { toast } from "react-hot-toast";
import { useSessionWA } from "../../../zustand/useSessionWA";

const useGetStatusWA = () => {
  const [loading, setLoading] = useState(true);
  const { setStatus } = useSessionWA();

  const getStatusWA = async () => {
    setLoading(true);
    try {
      const res = await api.get("/session/get-status");
      const status = res.data.status;

      setStatus(status);
      // delay 3000 ms
    } catch (error) {
      console.log(error);
      //   toast.error(error.message);
      if (error) {
        toast.error((error as { message: string; code: number })?.message || "occured error");
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, getStatusWA };
};

export default useGetStatusWA;
