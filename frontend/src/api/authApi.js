import axiosClient from "./axiosClient";

export const register = async (userData) => {
  const response = await axiosClient.post("/auth/register", userData);
  return response.data;
};

export const login = async (credentials) => {
  const response = await axiosClient.post("/auth/login", credentials);
  return response.data;
};

export async function getCurrentUser(token) {
  const response = await axiosClient.get("/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}