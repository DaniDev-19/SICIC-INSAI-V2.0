export interface Role {
  id: number;
  nombre: string;
  descripcion: string;
  permisos: Record<string, string[]>;
  status: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRoleDto {
  nombre: string;
  descripcion: string;
  permisos: Record<string, string[]>;
}

export interface UpdateRoleDto extends Partial<CreateRoleDto> {
  status?: boolean;
}

export interface RoleResponse {
  status: 'success' | 'error';
  message?: string;
  data: Role | Role[];
}
