import axios from 'axios';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:4000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor optimizado: No ensucia la consola con 401 esperados
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Solo logueamos errores que no sean 401 (ya que el 401 se maneja en useAuth)
    if (error.response?.status !== 401) {
      console.error('Error de API:', error.response?.data?.message || error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;
