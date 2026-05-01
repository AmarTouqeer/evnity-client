// API Configuration and Service Layer
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// Generic API call function
const apiCall = async (endpoint, options = {}) => {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: getAuthHeaders(),
      ...options,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Something went wrong");
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// Authentication APIs
export const authAPI = {
  register: async (userData) => {
    return apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  },

  verifyOTP: async (otp) => {
    return apiCall("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ otp }),
    });
  },

  resendOTP: async () => {
    return apiCall("/auth/resend-otp", {
      method: "POST",
    });
  },

  login: async (credentials) => {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  },

  logout: async () => {
    return apiCall("/auth/logout", {
      method: "POST",
    });
  },

  forgotPassword: async (email) => {
    return apiCall("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  },

  resetPassword: async (resetToken, password) => {
    return apiCall(`/auth/reset-password/${resetToken}`, {
      method: "PUT",
      body: JSON.stringify({ password }),
    });
  },

  getMe: async () => {
    return apiCall("/auth/me");
  },

  updatePassword: async (passwords) => {
    return apiCall("/auth/update-password", {
      method: "PUT",
      body: JSON.stringify(passwords),
    });
  },
};

// Event APIs
export const eventAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/events${queryString ? `?${queryString}` : ""}`);
  },

  getById: async (id) => {
    return apiCall(`/events/${id}`);
  },

  create: async (eventData) => {
    return apiCall("/events", {
      method: "POST",
      body: JSON.stringify(eventData),
    });
  },

  update: async (id, eventData) => {
    return apiCall(`/events/${id}`, {
      method: "PUT",
      body: JSON.stringify(eventData),
    });
  },

  delete: async (id) => {
    return apiCall(`/events/${id}`, {
      method: "DELETE",
    });
  },

  getMyEvents: async () => {
    return apiCall("/events/provider/my-events");
  },
};

// Service APIs
export const serviceAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/services${queryString ? `?${queryString}` : ""}`);
  },

  getById: async (id) => {
    return apiCall(`/services/${id}`);
  },

  create: async (serviceData) => {
    return apiCall("/services", {
      method: "POST",
      body: JSON.stringify(serviceData),
    });
  },

  update: async (id, serviceData) => {
    return apiCall(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(serviceData),
    });
  },

  delete: async (id) => {
    return apiCall(`/services/${id}`, {
      method: "DELETE",
    });
  },

  getMyServices: async () => {
    return apiCall("/services/provider/my-services");
  },
};

// Resource APIs
export const resourceAPI = {
  getAll: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/resources${queryString ? `?${queryString}` : ""}`);
  },

  getById: async (id) => {
    return apiCall(`/resources/${id}`);
  },

  create: async (resourceData) => {
    return apiCall("/resources", {
      method: "POST",
      body: JSON.stringify(resourceData),
    });
  },

  update: async (id, resourceData) => {
    return apiCall(`/resources/${id}`, {
      method: "PUT",
      body: JSON.stringify(resourceData),
    });
  },

  delete: async (id) => {
    return apiCall(`/resources/${id}`, {
      method: "DELETE",
    });
  },

  getMyResources: async () => {
    return apiCall("/resources/provider/my-resources");
  },
};

// Booking APIs
export const bookingAPI = {
  getAll: async () => {
    return apiCall("/bookings");
  },

  getById: async (id) => {
    return apiCall(`/bookings/${id}`);
  },

  create: async (bookingData) => {
    return apiCall("/bookings", {
      method: "POST",
      body: JSON.stringify(bookingData),
    });
  },

  update: async (id, bookingData) => {
    return apiCall(`/bookings/${id}`, {
      method: "PUT",
      body: JSON.stringify(bookingData),
    });
  },

  confirm: async (id) => {
    return apiCall(`/bookings/${id}/confirm`, {
      method: "PUT",
    });
  },

  cancel: async (id) => {
    return apiCall(`/bookings/${id}/cancel`, {
      method: "PUT",
    });
  },

  accept: async (id) => {
    return apiCall(`/bookings/${id}/accept`, {
      method: "PUT",
    });
  },

  reject: async (id, reason) => {
    return apiCall(`/bookings/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ rejectionReason: reason }),
    });
  },

  getProviderDashboardStats: async () => {
    return apiCall("/bookings/provider/dashboard-stats");
  },

  uploadReceipt: async (id, formData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/bookings/${id}/receipt`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  },

  complete: async (id) => {
    return apiCall(`/bookings/${id}/complete`, {
      method: "PUT",
    });
  },

  getProviderPaidBookings: async () => {
    return apiCall("/bookings/provider/paid");
  },
};

// Payments APIs
export const paymentAPI = {
  createStripeCheckoutSession: async (bookingId) => {
    return apiCall("/payments/stripe/checkout-session", {
      method: "POST",
      body: JSON.stringify({ bookingId }),
    });
  },

  getBookingPaymentDetails: async (bookingId) => {
    return apiCall(`/payments/booking/${bookingId}`);
  },

  verifyStripeSession: async (sessionId, bookingId) => {
    return apiCall("/payments/stripe/verify-session", {
      method: "POST",
      body: JSON.stringify({ sessionId, bookingId }),
    });
  },

  // ✅ Admin dashboard — total deducted platform fees
  getAdminDeductedFees: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(
      `/payments/stripe/admin/deducted-fees${queryString ? `?${queryString}` : ""}`
    );
  },
};

// User APIs
export const userAPI = {
  getProfile: async () => {
    return apiCall("/users/profile");
  },

  updateProfile: async (userData) => {
    return apiCall("/users/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  },

  uploadAvatar: async (formData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/users/avatar`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  },
};

// Provider Stripe APIs
export const providerStripeAPI = {
  getStatus: async () => {
    return apiCall("/providers/stripe/status");
  },

  getConnectUrl: async () => {
    return apiCall("/providers/stripe/connect-url");
  },

  disconnect: async () => {
    return apiCall("/providers/stripe/disconnect", {
      method: "POST",
    });
  },

  verifyReady: async () => {
    return apiCall("/providers/stripe/verify");
  },
};

// Notification APIs
export const notificationAPI = {
  getAll: async () => {
    return apiCall("/notifications");
  },

  markAsRead: async (id) => {
    return apiCall(`/notifications/${id}/read`, {
      method: "PUT",
    });
  },

  markAllAsRead: async () => {
    return apiCall("/notifications/read-all", {
      method: "PUT",
    });
  },

  delete: async (id) => {
    return apiCall(`/notifications/${id}`, {
      method: "DELETE",
    });
  },
};

// Review APIs
export const reviewAPI = {
  create: async (reviewData) => {
    return apiCall("/reviews", {
      method: "POST",
      body: JSON.stringify(reviewData),
    });
  },

  update: async (id, reviewData) => {
    return apiCall(`/reviews/${id}`, {
      method: "PUT",
      body: JSON.stringify(reviewData),
    });
  },

  delete: async (id) => {
    return apiCall(`/reviews/${id}`, {
      method: "DELETE",
    });
  },
};

// Complaint APIs
export const complaintAPI = {
  getAll: async () => {
    return apiCall("/complaints");
  },

  getById: async (id) => {
    return apiCall(`/complaints/${id}`);
  },

  create: async (complaintData) => {
    return apiCall("/complaints", {
      method: "POST",
      body: JSON.stringify(complaintData),
    });
  },

  update: async (id, complaintData) => {
    return apiCall(`/complaints/${id}`, {
      method: "PUT",
      body: JSON.stringify(complaintData),
    });
  },
};

// Upload API
export const uploadAPI = {
  uploadImage: async (formData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/upload/image`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });
    return response.json();
  },

  uploadMultiple: async (formData) => {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to upload images");
    }

    return response.json();
  },
};

// Admin APIs
export const adminAPI = {
  getStats: async () => {
    return apiCall("/admin/stats");
  },

  getUsers: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    return apiCall(`/admin/users${queryString ? `?${queryString}` : ""}`);
  },

  verifyProvider: async (id) => {
    return apiCall(`/admin/users/${id}/verify`, {
      method: "PUT",
    });
  },

  rejectProvider: async (id, reason) => {
    return apiCall(`/admin/users/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  },

  blockUser: async (id) => {
    return apiCall(`/admin/users/${id}/block`, {
      method: "PUT",
    });
  },

  unblockUser: async (id) => {
    return apiCall(`/admin/users/${id}/unblock`, {
      method: "PUT",
    });
  },

  approveEvent: async (id) => {
    return apiCall(`/admin/events/${id}/approve`, {
      method: "PUT",
    });
  },

  rejectEvent: async (id, reason) => {
    return apiCall(`/admin/events/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  },

  approveService: async (id) => {
    return apiCall(`/admin/services/${id}/approve`, {
      method: "PUT",
    });
  },

  rejectService: async (id, reason) => {
    return apiCall(`/admin/services/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  },

  approveResource: async (id) => {
    return apiCall(`/admin/resources/${id}/approve`, {
      method: "PUT",
    });
  },

  rejectResource: async (id, reason) => {
    return apiCall(`/admin/resources/${id}/reject`, {
      method: "PUT",
      body: JSON.stringify({ reason }),
    });
  },
};

export default {
  authAPI,
  eventAPI,
  serviceAPI,
  resourceAPI,
  bookingAPI,
  paymentAPI,
  userAPI,
  providerStripeAPI,
  notificationAPI,
  reviewAPI,
  complaintAPI,
  uploadAPI,
  adminAPI,
};