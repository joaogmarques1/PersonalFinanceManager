import axiosClient from "../../api/axiosClient";

export const fetchBusinessTransactions = async (businessId) => {
    const response = await axiosClient.get(`/business/${businessId}/transactions/`);
    return response.data;
};

export const createBusinessTransaction = async (businessId, data) => {
    const response = await axiosClient.post(`/business/${businessId}/transactions/`, data);
    return response.data;
};

export const deleteBusinessTransaction = async (businessId, transactionId) => {
    const response = await axiosClient.delete(`/business/${businessId}/transactions/${transactionId}`);
    return response.data;
};

export const createBusiness = async (data) => {
    const response = await axiosClient.post(`/business/`, data);
    return response.data;
};

export const fetchBusinessCategories = async (businessId) => {
    const response = await axiosClient.get(`/business/${businessId}/categories/`);
    return response.data;
};

export const createBusinessCategory = async (businessId, data) => {
    const response = await axiosClient.post(`/business/${businessId}/categories/`, data);
    return response.data;
};

export const updateBusinessCategory = async (businessId, categoryId, data) => {
    const response = await axiosClient.put(`/business/${businessId}/categories/${categoryId}`, data);
    return response.data;
};

export const deleteBusinessCategory = async (businessId, categoryId) => {
    const response = await axiosClient.delete(`/business/${businessId}/categories/${categoryId}`);
    return response.data;
};

export const fetchUserBusinesses = async () => {
    const response = await axiosClient.get(`/business/`);
    return response.data;
};
