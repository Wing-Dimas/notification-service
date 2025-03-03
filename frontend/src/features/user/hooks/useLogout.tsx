import { useState } from "react";
import { useAuthContext } from "../../../contexts/AuthContext";
import api from "../../../api";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const useLogout = () => {
  const { setAuthUser } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const logout = async () => {
    // const success = handleInputErrors({ username, password });

    // if (!success) return;
    setLoading(true);

    try {
      const res = await api.post("/logout");
      console.log(res);
      // local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setAuthUser(null);

      navigate("/");
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

  return { loading, logout };
};

export default useLogout;
