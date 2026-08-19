export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'citizen';
  reportsSubmitted: number;
  issuesResolved: number;
  phone?: string;
  ward?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
