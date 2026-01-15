import axiosClient from "../../api/axiosClient";

export const fetchLoans = async () => {
  const response = await axiosClient.get("/loans/");
  return response.data;
};

export const createLoan = async (loanData) => {
  const response = await axiosClient.post("/loans/", loanData);
  return response.data;
};

export const deleteLoan = async (loanId) => {
  const response = await axiosClient.delete(`/loans/${loanId}`);
  return response.data;
};

export const linkCardToLoan = async (loanId, cardId) => {
  const response = await axiosClient.patch(`/loans/${loanId}/link-card`, { used_credit_card: cardId });
  return response.data;
};

export const repayLoan = async (loanId, repaymentData) => {
  // repaymentData: { amount, date, description, payment_method }
  const response = await axiosClient.post(`/loans/${loanId}/repayment`, repaymentData);
  return response.data;
};

export const correctLoanBalance = async (loanId, correctionData) => {
  // correctionData: { new_balance, reason }
  const response = await axiosClient.post(`/loans/${loanId}/correct-balance`, correctionData);
  return response.data;
};
