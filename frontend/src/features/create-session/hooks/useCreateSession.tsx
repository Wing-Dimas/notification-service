import { useState } from "react";
import api from "../../../api";
import { toast } from "react-hot-toast";
import { delay } from "../../../libs/utils";

const useCreateSession = () => {
  const [loading, setLoading] = useState(false);

  const createSession = async () => {
    setLoading(true);
    try {
      const res = await api.post("/session/create-session");
      console.log(res);
      await delay(3000);
      toast.success("a qr has appeared on the website, scan it now!");
      setLoading(false);
      // delay 3000 ms
    } catch (error) {
      console.log(error);
      //   toast.error(error.message);
      if (error) {
        toast.error((error as { message: string; code: number })?.message || "occured error");
      }
    } finally {
      console.log("test");
      setLoading(false);
    }
  };

  return { loading, createSession };
};

export default useCreateSession;
