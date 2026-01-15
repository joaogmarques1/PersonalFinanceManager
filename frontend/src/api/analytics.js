import axiosClient from './axiosClient';

const analyticsApi = {
    getMonthlySummary: async (start_date, end_date, category_id, exclude_credit_card, exclude_card_repayment) => {
        // start_date/end_date typically strings "YYYY-MM-DD"
        const response = await axiosClient.get('/transactions/analytics/monthly-summary', {
            params: { start_date, end_date, category_id, exclude_credit_card, exclude_card_repayment }
        });
        return response.data;
    },

    getSpendingByCategory: async (start_date, end_date, category_id, exclude_credit_card, exclude_card_repayment) => {
        const response = await axiosClient.get('/transactions/analytics/spending-by-category', {
            params: { start_date, end_date, category_id, exclude_credit_card, exclude_card_repayment }
        });
        return response.data;
    },

    getLoansAnalytics: async () => {
        const response = await axiosClient.get('/loans/analytics');
        return response.data;
    },

    getCreditCardsAnalytics: async () => {
        const response = await axiosClient.get('/credit-cards/analytics');
        return response.data;
    }
};

export default analyticsApi;
