import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { animalesService } from '../services/animales.service';
import { useDebounce } from './use-debounce';

export function useAnimales(initialSearch = '', limit = 10) {
  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 500);

  const { data: response, isLoading } = useQuery({
    queryKey: ['animales', debouncedSearch, limit],
    queryFn: () => animalesService.getAll({ 
      page: 1, 
      limit, 
      search: debouncedSearch 
    }),
  });

  return {
    animales: response?.data || [],
    isLoading,
    search,
    setSearch,
  };
}
