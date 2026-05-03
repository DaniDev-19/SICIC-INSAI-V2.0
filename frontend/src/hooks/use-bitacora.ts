import { useState, useEffect } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { bitacoraService } from '@/services/bitacora.service';
import type { PaginationData } from '@/types/pagination';

export function useBitacora() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(5);
  const [modulo, setModulo] = useState('all');
  const [accion, setAccion] = useState('all');
  const [username, setUsername] = useState('');
  const [debouncedUsername, setDebouncedUsername] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedUsername(username);
      setPage(1);
    }, 300);

    return () => clearTimeout(handler);
  }, [username]);

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['bitacora', page, limit, modulo, accion, debouncedUsername],
    queryFn: () => bitacoraService.getLogs({
      page,
      limit,
      modulo: modulo === 'all' ? '' : modulo,
      accion: accion === 'all' ? '' : accion,
      username: debouncedUsername
    }),
    placeholderData: keepPreviousData,
    staleTime: 30000,
  });

  const { data: modulos = [] } = useQuery({
    queryKey: ['bitacora', 'modulos'],
    queryFn: bitacoraService.getModulos,
    staleTime: 3600000,
  });

  const pagination: PaginationData = {
    totalCount: response?.pagination?.total || 0,
    totalPages: response?.pagination?.pages || 1,
    currentPage: response?.pagination?.page || 1,
    limit,
  };

  return {
    logs: response?.data || [],
    modulos,
    pagination,
    isLoading,
    isError,
    page,
    limit,
    modulo,
    accion,
    username,
    setPage,
    setLimit,
    setModulo: (val: string) => { setModulo(val); setPage(1); },
    setAccion: (val: string) => { setAccion(val); setPage(1); },
    setUsername
  };
}
