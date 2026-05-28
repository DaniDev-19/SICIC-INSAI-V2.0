import type { ApiResponse, PaginationData } from './pagination';
import type { UsuarioInstancia } from './user';

export interface MasterInstance {
  id: number;
  nombre_mostrable: string;
  db_name: string;
  status: boolean;
  created_at?: string;
  _count?: { usuario_instancia: number };
  usuario_instancia?: (UsuarioInstancia & {
    usuarios?: { id: number; username: string; email: string; status: boolean };
  })[];
}

export interface CreateInstanceDto {
  nombre_mostrable: string;
  db_name: string;
  status?: boolean;
}

export interface UpdateInstanceDto {
  nombre_mostrable?: string;
  status?: boolean;
}

export interface InstancesResponse extends ApiResponse<MasterInstance[]> {
  pagination?: PaginationData;
}

export interface SingleInstanceResponse extends ApiResponse<MasterInstance> {}
