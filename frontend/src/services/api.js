import axios from 'axios';

// Base API URL. In production/render, it will use VITE_API_BASE. In development, it defaults to http://localhost:8000
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach authentication token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('bs_user_token');
  if (token) {
    // If endpoints are standard FastAPI endpoints, we can pass authorization header or send it in request payload
    config.headers['Authorization'] = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Helper to get active user ID
const getActiveUserId = () => {
  const user = localStorage.getItem('bs_user_profile');
  if (user) {
    try {
      return JSON.parse(user).id;
    } catch (e) {
      return null;
    }
  }
  return null;
};

export const apiService = {
  // Google Auth Endpoint
  googleAuth: async (credential) => {
    const response = await api.post('/api/auth/google', { credential });
    if (response.data?.token) {
      localStorage.setItem('bs_user_token', response.data.token);
      localStorage.setItem('bs_user_profile', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Update Profile Details (demographics)
  updateProfile: async (profileData) => {
    const token = localStorage.getItem('bs_user_token');
    const response = await api.post('/api/users/profile', { ...profileData, token });
    if (response.data?.success && response.data?.user) {
      localStorage.setItem('bs_user_profile', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  // Chat Companion API
  sendMessage: async (message, sessionId, language = 'English') => {
    const userId = getActiveUserId();
    const response = await api.post('/chat', { message, session_id: sessionId, language, user_id: userId });
    return response.data;
  },

  // Image Upload and Vision Analysis
  analyzeImage: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post('/analyze-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // ML Risk Score Predictor
  predictRisk: async (data) => {
    const response = await api.post('/predict-risk', data);
    return response.data;
  },

  // Submit Complaint to DB
  submitComplaint: async (data) => {
    const userId = getActiveUserId();
    const response = await api.post('/submit-complaint', { ...data, user_id: userId });
    return response.data;
  },

  // Get All Schemes matching user profile
  recommendSchemes: async (data) => {
    const userId = getActiveUserId();
    const response = await api.post('/recommend-schemes', { ...data, user_id: userId });
    return response.data;
  },

  // Get Complaints List
  getComplaints: async () => {
    const userId = getActiveUserId();
    const response = await api.get('/complaints', {
      params: userId ? { user_id: userId } : {}
    });
    return response.data;
  },

  // Get Single Complaint Detail
  getComplaint: async (id) => {
    const response = await api.get(`/complaint/${id}`);
    return response.data;
  },

  // Update Complaint Status
  updateComplaintStatus: async (id, status) => {
    const response = await api.put(`/complaint/${id}/status`, { status });
    return response.data;
  },
};

export default apiService;
