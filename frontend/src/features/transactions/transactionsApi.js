// frontend/src/features/transactions/transactionsApi.js
import axiosClient from "../../api/axiosClient";

// Obter todas as transações
export const fetchTransactions = async (sortBy = "date") => {
  const response = await axiosClient.get(`/transactions/?sort_by=${sortBy}`);
  return response.data;
};

// Criar uma nova transação
export const createTransaction = async (transactionData) => {
  const response = await axiosClient.post("/transactions/", transactionData);
  return response.data;
};

// Atualizar uma transação existente
export const updateTransaction = async (id, transactionData) => {
  const response = await axiosClient.put(`/transactions/${id}`, transactionData);
  return response.data;
};

// Eliminar uma transação
export const deleteTransaction = async (id) => {
  const response = await axiosClient.delete(`/transactions/${id}`);
  return response.data;
};