import axios from 'axios';
import type { AxiosInstance } from 'axios';
import { CONFIG } from '../config/config';
import type { Report, SubmitReportPayload } from '../types/report';
import type { User } from '../types/user';
import { mockApiService } from './mockApi';

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

export const apiService = {
  async getMyReports(): Promise<Report[]> {
    if (CONFIG.USE_MOCK_API) {
      return mockApiService.getMyReports();
    }
    const response = await apiClient.get<Report[]>('/reports/me');
    return response.data;
  },

  async getReport(id: string): Promise<Report> {
    if (CONFIG.USE_MOCK_API) {
      return mockApiService.getReport(id);
    }
    const response = await apiClient.get<Report>(`/reports/${id}`);
    return response.data;
  },

  async submitReport(payload: SubmitReportPayload): Promise<Report> {
    if (CONFIG.USE_MOCK_API) {
      return mockApiService.submitReport(payload);
    }

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
    if (CONFIG.USE_MOCK_API) {
      return mockApiService.getCurrentUser();
    }
    const response = await apiClient.get<User>('/auth/me');
    return response.data;
  },
};
