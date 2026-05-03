import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { enfermedadesService } from '../services/enfermedades.service';
import { useDebounce } from './use-debounce';

export function useEnfermedades(initialSearch = '', limit = 10) {
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading } = useQuery({
    queryKey: ['enfermedades', debouncedSearch, limit],
    queryFn: () => enfermedadesService.getAll({ 
      page: 1, 
      limit, 
      search: debouncedSearch 
    }),
  });

  return {
    enfermedades: response?.data || [],
    isLoading,
    search,
    setSearch,
  };
}
