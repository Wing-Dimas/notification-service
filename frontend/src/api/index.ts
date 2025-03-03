import axios from "axios";
import { toast } from "react-hot-toast";

const api = axios.create({
  //   baseURL: import.meta.env.VITE_BACKEND_URL
  baseURL: "/api",
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const originalRequest = error.config;

    // If the error status is 401 and there is no originalRequest._retry flag,
    // it means the token has expired and we need to refresh it
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // const refreshToken = localStorage.getItem("refreshToken");
        const response = await axios.post("/api/refresh-token");
        const { access_token } = response.data.data;

        localStorage.setItem("token", access_token);

        // Retry the original request with the new token
        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return axios(originalRequest);
      } catch (error) {
        // Handle refresh token error or redirect to login
        console.log(error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        toast.error("Session expired");
        new Response("", {
          status: 302,
          headers: {
            Location: "/",
          },
        });
      }
    }

    return Promise.reject(error.response.data);
  }
);

export default api;
