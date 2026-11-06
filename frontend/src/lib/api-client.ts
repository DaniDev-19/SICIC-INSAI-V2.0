import axios from 'axios';
import { toast } from 'sonner';

export const getBaseApiUrl = (): string => {
  if (typeof window !== 'undefined') {
    const customApi = localStorage.getItem('custom_api_url');
    if (customApi) return customApi;

    const host = window.location.hostname;
    // Si navegamos desde una IP (por ejemplo 192.168.31.46 desde el teléfono móvil)
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      const proto = window.location.protocol || 'http:';
      return `${proto}//${host}:4000/api`;
    }
  }

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl;
  }

  // Fallback para red local móvil y APK
  return 'http://192.168.31.46:4000/api';
};

const apiClient = axios.create({
  baseURL: getBaseApiUrl(),
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  config.baseURL = getBaseApiUrl();

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token && !config.headers['Authorization']) {
    config.headers['Authorization'] = `Bearer ${token}`;
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
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;

    if (status === 401) {
      // Contramedida de seguridad: Purga de token e instancias manipuladas o expiradas
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        localStorage.removeItem('token');
        localStorage.removeItem('selected_instance');
        localStorage.removeItem('auth-storage');
        window.location.href = '/login';
      }
    } else if (status === 429) {
      // Feedback UI/UX para Rate Limiting
      toast.warning('Demasiadas solicitudes: ' + message);
    } else if (!error.response) {
      // Servidor completamente caído o fallo de red (sin respuesta)
      console.error('Fallo grave de conexión con el servidor:', message);
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login') && !window.location.pathname.includes('/500')) {
        window.location.href = '/500';
      }
    } else if (status >= 500) {
      // Error interno del servidor (endpoint individual falló, pero el servidor responde)
      console.error('Error interno del servidor (500):', message);
    } else {
      console.error('Error de API:', message);
    }

    return Promise.reject(error);
  }
);


export default apiClient;

