import axios from "axios";
import { signOut } from "next-auth/react";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8000",
});

if (typeof window !== "undefined") {
  api.interceptors.response.use(
    (response) => response,
    (error) => {
      if (
        error.response &&
        (error.response.status === 401 || error.response.status === 403)
      ) {
        signOut({ callbackUrl: "/signin" });
      }
      return Promise.reject(error);
    }
  );
}

export default api;
