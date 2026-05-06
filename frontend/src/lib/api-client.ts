import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  // Solo agregar llave de idempotencia para métodos que modifican estado
  const methods = ['post', 'put', 'patch', 'delete'];
  if (methods.includes(config.method?.toLowerCase() || '')) {
    // Generar un UUID si no existe ya en los headers
    if (!config.headers['X-Idempotency-Key']) {
      config.headers['X-Idempotency-Key'] = crypto.randomUUID();
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
