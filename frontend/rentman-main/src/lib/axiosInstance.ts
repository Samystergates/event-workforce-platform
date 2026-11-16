import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:8060";

const defaultOptions = {
  baseURL: baseUrl,
};

const instance = axios.create(defaultOptions);

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async function (error) {
    return error.response;
  },
);

export { instance as axios };
