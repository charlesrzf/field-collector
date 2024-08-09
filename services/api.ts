import axios, { AxiosRequestConfig } from "axios";

export const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
});

axiosInstance.interceptors.request.use(async (req) => {
  const user = JSON.parse(localStorage.getItem("user") ?? "{}");
  const sessionToken = user?.token;

  if (sessionToken && !req.url?.includes("/login")) {
    req.headers.Authorization = "Bearer " + sessionToken;
  }

  return req;
});

interface IHttp {
  get(url: string, config?: AxiosRequestConfig): Promise<any>;
  post(url: string, data: any): Promise<any>;
  put(url: string, data: any): Promise<any>;
  delete(url: string): Promise<any>;
}

const api: IHttp = {
  get: function (url, config) {
    return axiosInstance.get(url, config).then((res) => res.data);
  },

  post: function (url, data) {
    return axiosInstance.post(url, data).then((res) => res.data);
  },

  put: function (url, data) {
    return axiosInstance.put(url, data).then((res) => res.data);
  },

  delete: function (url) {
    return axiosInstance.delete(url).then((res) => res.data);
  },
};

export default api;
