import { useState } from "react";
import api from "../../../api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const useRegister = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const register = async ({ email, username, password }: { email: string; username: string; password: string }) => {
    setLoading(true);
    try {
      await api.post("/signup", { email, username, password });

      toast.success("Register berhasil");
      navigate("/");
    } catch (error) {
      console.log(error);
      if (error) {
        toast.error((error as { message: string; code: number })?.message || "occured error");
      }
    } finally {
      setLoading(false);
    }
  };

  return { loading, register };
};

export default useRegister;
