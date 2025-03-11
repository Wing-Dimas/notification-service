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
    setLoading(true);

    try {
      await api.post("/logout");
      // local storage
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      setAuthUser(null);

      navigate("/");
    } catch (error) {
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
