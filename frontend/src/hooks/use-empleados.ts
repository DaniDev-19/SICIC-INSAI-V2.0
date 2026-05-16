import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { type AxiosError } from 'axios';
import { empleadosService } from '@/services/empleados.service';
import { toast } from 'sonner';
import { useDebounce } from '@/hooks/use-debounce';

export function useEmpleados() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [search, setSearch] = useState('');
  const [departamentoId, setDepartamentoId] = useState('all');
  const [statusLaboral, setStatusLaboral] = useState('all');

  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['empleados', page, limit, debouncedSearch, departamentoId, statusLaboral],
    queryFn: () => empleadosService.getAll({ 
      page, 
      limit, 
      search: debouncedSearch, 
      departamento_id: departamentoId === 'all' ? undefined : departamentoId,
      status_laboral: statusLaboral === 'all' ? undefined : statusLaboral
    }),
  });

  // Consultas de catálogos
  const { data: cargosResp } = useQuery({ queryKey: ['catalogo-cargos'], queryFn: empleadosService.getCargos });
  const { data: deptoResp } = useQuery({ queryKey: ['catalogo-deptos'], queryFn: empleadosService.getDepartamentos });
  const { data: profResp } = useQuery({ queryKey: ['catalogo-profesiones'], queryFn: empleadosService.getProfesiones });
  const { data: oficResp } = useQuery({ queryKey: ['catalogo-oficinas'], queryFn: empleadosService.getOficinas });
  const { data: contResp } = useQuery({ queryKey: ['catalogo-contratos'], queryFn: empleadosService.getContratos });

  const createMutation = useMutation({
    mutationFn: empleadosService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      toast.success('Empleado registrado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al registrar el empleado');
    },
  });

  const updateMutation = useMutation({
    mutationFn: empleadosService.update,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['empleado-detail', variables.id] });
      toast.success('Empleado actualizado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al actualizar el empleado');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: empleadosService.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['empleado-detail', id] });
      toast.success('Empleado eliminado correctamente');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al eliminar el empleado');
    },
  });

  const exportMutation = useMutation({
    mutationFn: empleadosService.exportExcel,
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `reporte_empleados_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      toast.success('Reporte exportado correctamente');
    },
    onError: () => {
      toast.error('Error al exportar el reporte');
    }
  });

  // Mutaciones de Catálogos
  const createCargoMutation = useMutation({
    mutationFn: empleadosService.createCargo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-cargos'] });
      toast.success('Cargo creado');
    }
  });
  const updateCargoMutation = useMutation({
    mutationFn: empleadosService.updateCargo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo-cargos'] })
  });
  const deleteCargoMutation = useMutation({
    mutationFn: empleadosService.deleteCargo,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo-cargos'] })
  });

  const createDeptoMutation = useMutation({
    mutationFn: empleadosService.createDepartamento,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-deptos'] });
      toast.success('Departamento creado');
    }
  });
  const updateDeptoMutation = useMutation({
    mutationFn: empleadosService.updateDepartamento,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo-deptos'] })
  });
  const deleteDeptoMutation = useMutation({
    mutationFn: empleadosService.deleteDepartamento,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo-deptos'] })
  });

  const createProfMutation = useMutation({
    mutationFn: empleadosService.createProfesion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-profesiones'] });
      toast.success('Profesión creada');
    }
  });
  const updateProfMutation = useMutation({
    mutationFn: empleadosService.updateProfesion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo-profesiones'] })
  });
  const deleteProfMutation = useMutation({
    mutationFn: empleadosService.deleteProfesion,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo-profesiones'] })
  });

  const createContratoMutation = useMutation({
    mutationFn: empleadosService.createContrato,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['catalogo-contratos'] });
      toast.success('Tipo de contrato creado');
    }
  });
  const updateContratoMutation = useMutation({
    mutationFn: empleadosService.updateContrato,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo-contratos'] })
  });
  const deleteContratoMutation = useMutation({
    mutationFn: empleadosService.deleteContrato,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['catalogo-contratos'] })
  });

  return {
    empleados: response?.data || [],
    pagination: response?.pagination || { totalCount: 0, totalPages: 0, currentPage: 1, limit: 5 },
    isLoading,
    error,
    page,
    limit,
    search,
    departamentoId,
    statusLaboral,
    setPage,
    setLimit,
    setSearch,
    setDepartamentoId,
    setStatusLaboral,
    
    // Catálogos
    catalogos: {
      cargos: cargosResp?.data || [],
      departamentos: deptoResp?.data || [],
      profesiones: profResp?.data || [],
      oficinas: oficResp?.data || [],
      contratos: contResp?.data || [],
    },

    createEmpleado: createMutation.mutateAsync,
    updateEmpleado: updateMutation.mutateAsync,
    deleteEmpleado: deleteMutation.mutateAsync,
    exportEmpleados: exportMutation.mutateAsync,
    
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    isExporting: exportMutation.isPending,

    // Mutaciones de Catálogos
    createCargo: createCargoMutation.mutateAsync,
    updateCargo: updateCargoMutation.mutateAsync,
    deleteCargo: deleteCargoMutation.mutateAsync,
    createDepartamento: createDeptoMutation.mutateAsync,
    updateDepartamento: updateDeptoMutation.mutateAsync,
    deleteDepartamento: deleteDeptoMutation.mutateAsync,
    createProfesion: createProfMutation.mutateAsync,
    updateProfesion: updateProfMutation.mutateAsync,
    deleteProfesion: deleteProfMutation.mutateAsync,
    createContrato: createContratoMutation.mutateAsync,
    updateContrato: updateContratoMutation.mutateAsync,
    deleteContrato: deleteContratoMutation.mutateAsync,
  };
}

export function useEmpleado(id: number | null) {
  const { data: response, isLoading, error } = useQuery({
    queryKey: ['empleado', id],
    queryFn: () => empleadosService.getById(id!),
    enabled: !!id,
  });

  return {
    empleado: response?.data,
    isLoading,
    error,
  };
}
