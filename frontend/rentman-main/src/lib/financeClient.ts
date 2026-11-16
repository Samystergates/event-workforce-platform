import axios from "axios";
import { getSession } from "next-auth/react";

const financeBaseUrl =
  process.env.NEXT_PUBLIC_FINANCE_URL ?? "http://localhost:8060";

export const financeAxios = axios.create({
  baseURL: financeBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

financeAxios.interceptors.request.use(async (config) => {
  const session: any = await getSession();
  const token = session?.user?.token;
  if (token) {
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

financeAxios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      error.message = "Your finance session is missing or expired. Sign in again.";
    } else if (error?.response?.status === 403) {
      error.message = "Your account does not have finance access.";
    }
    return Promise.reject(error);
  }
);
