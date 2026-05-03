import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { plagasService } from '../services/plagas.service';
import { useDebounce } from './use-debounce';

export function usePlagas(initialSearch = '', limit = 10) {
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading } = useQuery({
    queryKey: ['plagas', debouncedSearch, limit],
    queryFn: () => plagasService.getAll({ 
      page: 1, 
      limit, 
      search: debouncedSearch 
    }),
  });

  return {
    plagas: response?.data || [],
    isLoading,
    search,
    setSearch,
  };
}
