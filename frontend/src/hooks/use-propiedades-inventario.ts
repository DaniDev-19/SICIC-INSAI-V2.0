import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { propiedadesService } from '@/services/propiedades.service';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';

export function usePropiedadInventario(propiedadId: number) {
  const queryClient = useQueryClient();

  const { data: response, isLoading, error } = useQuery({
    queryKey: ['propiedad-inventario', propiedadId],
    queryFn: () => propiedadesService.getInventario(propiedadId),
    enabled: !!propiedadId, // Only fetch if we have an ID
  });

  const addCultivoMutation = useMutation({
    mutationFn: (data: any) => propiedadesService.addCultivo(propiedadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedad-inventario', propiedadId] });
      toast.success('Cultivo añadido al inventario');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al añadir cultivo');
    },
  });

  const removeCultivoMutation = useMutation({
    mutationFn: (inventarioId: number) => propiedadesService.removeCultivo(propiedadId, inventarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedad-inventario', propiedadId] });
      toast.success('Cultivo removido del inventario');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al remover cultivo');
    },
  });

  const addAnimalMutation = useMutation({
    mutationFn: (data: any) => propiedadesService.addAnimal(propiedadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedad-inventario', propiedadId] });
      toast.success('Animal añadido al inventario');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al añadir animal');
    },
  });

  const removeAnimalMutation = useMutation({
    mutationFn: (inventarioId: number) => propiedadesService.removeAnimal(propiedadId, inventarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedad-inventario', propiedadId] });
      toast.success('Animal removido del inventario');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al remover animal');
    },
  });

  const addHierroMutation = useMutation({
    mutationFn: (data: any) => propiedadesService.addHierro(propiedadId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedad-inventario', propiedadId] });
      toast.success('Hierro añadido a la propiedad');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al añadir hierro');
    },
  });

  const removeHierroMutation = useMutation({
    mutationFn: (inventarioId: number) => propiedadesService.removeHierro(propiedadId, inventarioId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['propiedad-inventario', propiedadId] });
      toast.success('Hierro removido de la propiedad');
    },
    onError: (error: AxiosError<{ message?: string }>) => {
      toast.error(error.response?.data?.message || 'Error al remover hierro');
    },
  });

  return {
    inventario: response?.data || { cultivos: [], animales: [], hierros: [] },
    isLoading,
    error,
    addCultivo: addCultivoMutation.mutateAsync,
    removeCultivo: removeCultivoMutation.mutateAsync,
    addAnimal: addAnimalMutation.mutateAsync,
    removeAnimal: removeAnimalMutation.mutateAsync,
    addHierro: addHierroMutation.mutateAsync,
    removeHierro: removeHierroMutation.mutateAsync,
    isAddingCultivo: addCultivoMutation.isPending,
    isAddingAnimal: addAnimalMutation.isPending,
    isAddingHierro: addHierroMutation.isPending,
  };
}
