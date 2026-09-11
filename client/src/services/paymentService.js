import axiosInstance from "./axiosInstance";

/**
 * Service helper for handling payments and refunds with backend Razorpay & MongoDB APIs
 */
export const createOrder = async (orderData) => {
  try {
    const res = await axiosInstance.post("/payment/create-order", orderData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const res = await axiosInstance.post("/payment/verify-payment", paymentData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const retryOrder = async (bookingId) => {
  try {
    const res = await axiosInstance.post(`/payment/retry-order/${bookingId}`);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const getPaymentLedger = async () => {
  try {
    const res = await axiosInstance.get("/payment/admin/payment-ledger");
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export const processRefund = async (refundData) => {
  try {
    const res = await axiosInstance.post("/payment/admin/process-refund", refundData);
    return res.data;
  } catch (error) {
    return error.response?.data || { success: false, message: error.message };
  }
};

export default {
  createOrder,
  verifyPayment,
  retryOrder,
  getPaymentLedger,
  processRefund,
};
