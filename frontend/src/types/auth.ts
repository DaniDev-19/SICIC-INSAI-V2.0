export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Instance {
  id: number;
  nombre: string;
  db_name: string;
  rol: string;
  permisos: any;
}

export interface LoginResponse {
  status: 'success' | 'error';
  message: string;
  data: {
    user: User | null;
    currentInstance: Instance | null;
  };
}

export interface AuthState {
  user: User | null;
  currentInstance: Instance | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
