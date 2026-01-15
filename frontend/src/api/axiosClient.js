import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000", // o backend FastAPI
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para adicionar o token a cada pedido
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosClient;
