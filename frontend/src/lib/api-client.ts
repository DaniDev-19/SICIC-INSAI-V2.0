import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const methods = ['post', 'put', 'patch', 'delete'];
  if (methods.includes(config.method?.toLowerCase() || '')) {
    if (!config.headers['X-Idempotency-Key']) {
      // Intenta usar la API nativa si existe, de lo contrario usa el reemplazo compatible
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        config.headers['X-Idempotency-Key'] = crypto.randomUUID();
      } else {
        // Reemplazo matemático compatible con HTTP estándar
        config.headers['X-Idempotency-Key'] = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
          const r = Math.random() * 16 | 0;
          const v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      }
    }
  }
  return config;
});


apiClient.interceptors.response.use(
  (response) => response,
  (error) => {

    if (error.response?.status !== 401) {
      console.error('Error de API:', error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
