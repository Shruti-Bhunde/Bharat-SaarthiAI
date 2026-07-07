import axios from 'axios';

// Base API URL. In development, Vite config proxies '/api' to 'http://localhost:8000'
// Let's also support direct fallback to localhost if relative proxy is not used.
const API_BASE = '/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const apiService = {
  // Chat Companion API
  sendMessage: async (message, sessionId, language = 'English') => {
    const response = await api.post('/chat', { message, session_id: sessionId, language });
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
    // data: { complaint_type, severity, location_type, traffic_density, time_of_day }
    const response = await api.post('/predict-risk', data);
    return response.data;
  },

  // Submit Complaint to DB
  submitComplaint: async (data) => {
    const response = await api.post('/submit-complaint', data);
    return response.data;
  },

  // Get All Schemes matching user profile
  recommendSchemes: async (data) => {
    // data: { age, occupation, income, gender, education }
    const response = await api.post('/recommend-schemes', data);
    return response.data;
  },

  // Get Complaints List
  getComplaints: async () => {
    const response = await api.get('/complaints');
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
