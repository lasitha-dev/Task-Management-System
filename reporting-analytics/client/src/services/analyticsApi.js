import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:5000';

// Development token for testing
const MOCK_JWT_TOKEN = 'mock-token-for-development';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${MOCK_JWT_TOKEN}`
  }
});

// Add JWT token to all requests if it exists in localStorage, otherwise use mock
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token') || MOCK_JWT_TOKEN;
  config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('jwt_token');
    }
    return Promise.reject(error);
  }
);

// Analytics API calls
export const analyticsApi = {
  // Get summary statistics for a period
  fetchSummary: async (period = 'week') => {
    try {
      const response = await api.get('/api/analytics/summary', {
        params: { period }
      });
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching summary:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get weekly completion data for chart
  fetchWeeklyData: async () => {
    try {
      const response = await api.get('/api/analytics/weekly');
      const data = response.data.data || response.data;
      // Ensure data is an array with proper format
      const weeklyData = Array.isArray(data) ? data : [];
      console.log('Weekly data fetched:', weeklyData);
      return { success: true, data: weeklyData };
    } catch (error) {
      console.error('Error fetching weekly data:', error.message);
      return { success: false, error: error.message, data: [] };
    }
  },

  // Get task status breakdown
  fetchStatusBreakdown: async () => {
    try {
      const response = await api.get('/api/analytics/status');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching status breakdown:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get per-user breakdown
  fetchUserBreakdown: async () => {
    try {
      const response = await api.get('/api/analytics/users');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching user breakdown:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Reports API calls
export const reportsApi = {
  // Get all reports
  fetchReports: async () => {
    try {
      const response = await api.get('/api/reports');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching reports:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Get single report
  fetchReport: async (id) => {
    try {
      const response = await api.get(`/api/reports/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error fetching report:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Generate new report
  generateReport: async (reportData) => {
    try {
      const response = await api.post('/api/reports/generate', reportData);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error generating report:', error.message);
      return { success: false, error: error.message };
    }
  },

  // Delete report
  deleteReport: async (id) => {
    try {
      const response = await api.delete(`/api/reports/${id}`);
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error deleting report:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Sync API calls
export const syncApi = {
  // Sync tasks from external service
  syncTasks: async () => {
    try {
      const response = await api.post('/api/sync/tasks');
      return { success: true, data: response.data.data };
    } catch (error) {
      console.error('Error syncing tasks:', error.message);
      return { success: false, error: error.message };
    }
  }
};

export default api;
