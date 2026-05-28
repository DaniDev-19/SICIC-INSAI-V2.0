import type { ApiResponse, PaginationData } from './pagination';

export interface UsuarioInstancia {
  usuario_id: number;
  instancia_id: number;
  rol_id: number;
  permisos_personalizados?: Record<string, string[]> | null;
  instancias?: { id: number; nombre_mostrable: string; db_name?: string };
  roles?: { id: number; nombre: string };
}

export interface MasterUser {
  id: number;
  username: string;
  email: string;
  status: boolean;
  created_at?: string;
  updated_at?: string;
  usuario_instancia?: UsuarioInstancia[];
}

export interface CreateUserDto {
  username: string;
  email: string;
  password: string;
  status?: boolean;
  initial_assignment?: {
    instancia_id: number;
    rol_id: number;
  };
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
  password?: string;
  status?: boolean;
}

export interface AssignInstanceDto {
  instancia_id: number;
  rol_id: number;
  permisos_personalizados?: Record<string, string[]> | null;
}

export interface UsersResponse extends ApiResponse<MasterUser[]> {
  pagination?: PaginationData;
}

export interface SingleUserResponse extends ApiResponse<MasterUser> {}
