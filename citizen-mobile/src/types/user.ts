export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'citizen' | 'officer' | 'commissioner';
  reports_submitted?: number;
  reportsSubmitted?: number;
  issues_resolved?: number;
  issuesResolved?: number;
  phone?: string;
  ward?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
