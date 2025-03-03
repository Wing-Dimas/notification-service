import { useState } from "react";
import { useAuthContext } from "../../../contexts/AuthContext";
import api from "../../../api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const useLogin = () => {
  const { setAuthUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const login = async ({ email, password }: { email: string; password: string }) => {
    setLoading(true);
    try {
      const res = await api.post("/login", { email, password });

      // local storage
      localStorage.setItem("token", res.data.access_token);
      localStorage.setItem("user", JSON.stringify(res.data));

      setAuthUser(res.data);

      navigate("/dashboard");
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

  return { loading, login };
};

export default useLogin;
