/**
 * Centralized API Client with Token Interceptors & Error Normalization
 */

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:8000/api/v1';

class ApiClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/+$/, ''); // Remove trailing slash
  }

  getToken() {
    return localStorage.getItem('swachhlens_auth_token');
  }

  setToken(token) {
    if (token) {
      localStorage.setItem('swachhlens_auth_token', token);
    } else {
      localStorage.removeItem('swachhlens_auth_token');
    }
  }

  removeToken() {
    localStorage.removeItem('swachhlens_auth_token');
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}/${endpoint.replace(/^\/+/, '')}`;
    const token = this.getToken();

    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...options.headers
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config = {
      ...options,
      headers
    };

    try {
      const response = await fetch(url, config);

      // Handle 401 Unauthorized: token expired or invalid
      if (response.status === 401 && !endpoint.includes('auth/login')) {
        this.removeToken();
        // Dispatch custom event for AuthContext to react without hard reloads
        window.dispatchEvent(new CustomEvent('swachhlens:unauthorized'));
        throw new Error('Your session has expired. Please log in again.');
      }

      const contentType = response.headers.get('content-type');
      let data = null;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        const errorMessage =
          (data && typeof data === 'object' && (data.detail || data.message || data.error)) ||
          `Request failed with status ${response.status}: ${response.statusText}`;
        const error = new Error(typeof errorMessage === 'string' ? errorMessage : JSON.stringify(errorMessage));
        error.status = response.status;
        error.data = data;
        throw error;
      }

      return data;
    } catch (err) {
      // Differentiate network connectivity errors from HTTP errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const networkError = new Error(
          `Unable to connect to backend server at ${this.baseUrl}. Please verify that the backend is running and CORS is enabled.`
        );
        networkError.isNetworkError = true;
        throw networkError;
      }
      throw err;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(body)
    });
  }

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(body)
    });
  }

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);
export { API_BASE_URL };
