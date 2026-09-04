import axios from "axios";

const API = axios.create({
  baseURL: `${import.meta.env.VITE_API_URL || "http://localhost:3000"}/api`,
  withCredentials: true,
});

export const registerUser = (user) => API.post("/auth/register", user);
export const loginUser = (user) => API.post("/auth/login", user);
export const logoutUser = () => API.post("/auth/logout");
export const getMe = () => API.get("/auth/me");

export const getCars = (params = {}) => API.get("/cars", { params });
export const getMyCars = () => API.get("/cars/my");
export const getCarById = (id) => API.get(`/cars/${id}`);
export const getMyCarById = (id) => API.get(`/cars/my/${id}`);
export const updateCar = (id, car) => API.put(`/cars/${id}`, car);
export const deleteCar = (id) => API.delete(`/cars/${id}`);
export const createCar = (carData) => API.post("/cars", carData);

export const getSavedCars = () => API.get("/user/saved");
export const saveCar = (carId) => API.post(`/user/saved/${carId}`);
export const removeSavedCar = (carId) => API.delete(`/user/saved/${carId}`);
export const getCompareCars = () => API.get("/user/compare");
export const addCompareCar = (carId) => API.post(`/user/compare/${carId}`);
export const removeCompareCar = (carId) => API.delete(`/user/compare/${carId}`);
export const clearCompareCars = () => API.delete("/user/compare");

export const getConversation = (conversationId) =>
  API.get(`/chat/conversations/${conversationId}`);
export const createConversation = (carId) =>
  API.post("/chat/conversations", { carId });
export const getMyConversations = () => API.get("/chat/conversations");
export const getMessages = (conversationId) =>
  API.get(`/chat/conversations/${conversationId}/messages`);
export const reportCar = (carId, reason) =>
  API.post(`/cars/${carId}/report`, { reason });

export const getBillingInfo = () => API.get("/payments/billing");
export const createProSubscription = () =>
  API.post("/payments/subscription/create");
export const verifyProSubscription = (data) =>
  API.post("/payments/subscription/verify", data);
export const cancelProSubscription = () =>
  API.post("/payments/subscription/cancel");
export const createVerificationOrder = (data) =>
  API.post("/payments/verification/order", data);
export const verifyVerificationPayment = (data) =>
  API.post("/payments/verification/verify", data);

export const getAdminStats = () => API.get("/admin/stats");
export const getAdminVerifications = () => API.get("/admin/verifications");
export const reviewAdminVerification = (id, data) =>
  API.patch(`/admin/verifications/${id}`, data);
export const getAdminReports = () => API.get("/admin/reports");
export const updateAdminReport = (id, status) =>
  API.patch(`/admin/reports/${id}`, { status });
export const getAdminPayments = () => API.get("/admin/payments");

export default API;