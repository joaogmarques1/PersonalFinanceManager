import axiosClient from "../../api/axiosClient";

export const fetchCreditCards = async () => {
    const response = await axiosClient.get("/credit-cards/");
    return response.data;
};

export const fetchCreditCardBalances = async () => {
    const response = await axiosClient.get("/loans/credit-cards/balances");
    return response.data;
};

export const createCreditCard = async (cardData) => {
    const response = await axiosClient.post("/credit-cards/", cardData);
    return response.data;
};

export const deleteCreditCard = async (cardId) => {
    const response = await axiosClient.delete(`/credit-cards/${cardId}`);
    return response.data;
};

export const correctCardBalance = async (cardId, correctionData) => {
    // correctionData: { balance, date, description }
    const response = await axiosClient.post(`/loans/credit-card/${cardId}/correct-balance`, correctionData);
    return response.data;
};

export const repayCreditCard = async (cardId, repaymentData) => {
    // repaymentData: { amount, date, description }
    const response = await axiosClient.post(`/loans/credit-card/${cardId}/repay`, repaymentData);
    return response.data;
};
