import type { Report, SubmitReportPayload } from './report';
import type { User } from './user';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface IApiService {
  submitReport(payload: SubmitReportPayload): Promise<Report>;
  getMyReports(): Promise<Report[]>;
  getReport(id: string): Promise<Report>;
  getCurrentUser(): Promise<User>;
}
