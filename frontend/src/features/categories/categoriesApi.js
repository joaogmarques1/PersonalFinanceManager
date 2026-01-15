import axiosClient from "../../api/axiosClient";

// Fetch all categories
export const fetchCategories = async () => {
    const response = await axiosClient.get("/categories/");
    return response.data;
};

// Create a new category (optional for now, but good to have)
export const createCategory = async (categoryData) => {
    const response = await axiosClient.post("/categories/", categoryData);
    return response.data;
};
