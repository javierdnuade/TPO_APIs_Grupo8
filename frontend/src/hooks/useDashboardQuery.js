import { useCallback, useState } from 'react';

export default function useDashboardQuery({ initialFilters, fetcher, validate }) {
  const [filters, setFilters] = useState({ ...initialFilters });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState([]);
  const [searched, setSearched] = useState(false);

  const clear = useCallback(() => {
    setError(null);
    setData([]);
    setSearched(false);
    setFilters({ ...initialFilters });
  }, [initialFilters]);

  const search = useCallback(async (e) => {
    e?.preventDefault?.();
    setError(null);

    const validationError = validate ? validate(filters) : null;
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    try {
      const result = await fetcher(filters);
      setData(Array.isArray(result) ? result : []);
      setSearched(true);
    } catch (err) {
      setError(err?.message ?? 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [filters, fetcher, validate]);

  return {
    filters,
    setFilters,
    loading,
    error,
    data,
    searched,
    search,
    clear,
    setError,
    setData,
    setSearched,
  };
}
