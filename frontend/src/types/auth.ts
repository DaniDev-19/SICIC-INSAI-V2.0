export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
  instanceId: string;
}

export type PermissionObject = Record<string, string[]>;

export interface Instance {
  id: number;
  nombre: string;
  db_name: string;
  rol: string;
  permisos: PermissionObject;
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
