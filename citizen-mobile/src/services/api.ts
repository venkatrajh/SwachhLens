import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { CONFIG } from '../config/config';
import type { Report, SubmitReportPayload } from '../types/report';
import type { User } from '../types/user';

const apiClient: AxiosInstance = axios.create({
  baseURL: CONFIG.API_BASE_URL,
  headers: {
    'Accept': 'application/json',
  },
  timeout: 15000,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('swachhlens_auth_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && !error.config.url?.includes('auth/login')) {
      localStorage.removeItem('swachhlens_auth_token');
      window.dispatchEvent(new CustomEvent('swachhlens:unauthorized'));
    }
    
    // Normalize errors a bit so the UI has an easier time
    if (!error.response && error.message === 'Network Error') {
      error.isNetworkError = true;
      error.message = 'Unable to connect to the backend server. Please verify your connection.';
    } else if (error.response?.data?.detail) {
      error.message = typeof error.response.data.detail === 'string' 
        ? error.response.data.detail 
        : JSON.stringify(error.response.data.detail);
    }
    
    return Promise.reject(error);
  }
);

export const apiService = {
  async login(email: string, pass: string): Promise<{ access_token: string }> {
    const response = await apiClient.post('/auth/login', { email, password: pass });
    return response.data;
  },

  async register(name: string, email: string, pass: string): Promise<any> {
    const response = await apiClient.post('/auth/register', { name, email, password: pass });
    return response.data;
  },

  async getMyReports(): Promise<Report[]> {
    const response = await apiClient.get<any>('/reports');
    return Array.isArray(response.data) ? response.data : (response.data.items || []);
  },

  async getReport(id: string): Promise<Report> {
    const response = await apiClient.get<Report>(`/reports/${id}`);
    return response.data;
  },

  async submitReport(payload: SubmitReportPayload): Promise<Report> {
    const formData = new FormData();
    if (payload.image) {
      if (typeof payload.image === 'string') {
        formData.append('image_url', payload.image);
      } else {
        formData.append('image', payload.image);
      }
    }
    if (payload.video) {
      formData.append('video', payload.video);
    }
    formData.append('latitude', payload.latitude.toString());
    formData.append('longitude', payload.longitude.toString());
    formData.append('timestamp', payload.timestamp);
    if (payload.description) {
      formData.append('description', payload.description);
    }

    const response = await apiClient.post<Report>('/reports', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },

  async getNotifications(): Promise<any[]> {
    const response = await apiClient.get<any>('/notifications');
    return Array.isArray(response.data) ? response.data : (response.data?.items || []);
  },

  async getUnreadNotificationCount(): Promise<number> {
    const response = await apiClient.get<{ unread_count: number }>('/notifications/unread-count');
    return response.data?.unread_count ?? 0;
  },

  async markNotificationRead(id: string): Promise<any> {
    const response = await apiClient.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async markAllNotificationsRead(): Promise<any> {
    const response = await apiClient.post('/notifications/mark-all-read');
    return response.data;
  },
};
