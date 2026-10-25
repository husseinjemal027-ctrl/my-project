import { useCallback, useEffect, useState } from 'react';
import { getContents } from '../services/contentService.js';

const PAGE_SIZE = 9;

export default function useContents() {
  const [items, setItems] = useState([]);
  const [page, setPage] = useState(1);
  const [category, setCategory] = useState('all');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, limit: PAGE_SIZE, totalItems: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [refreshVersion, setRefreshVersion] = useState(0);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    const timer = window.setTimeout(() => {
      getContents({ page, limit: PAGE_SIZE, category, search })
        .then((response) => {
          if (!active) return;
          setItems(response.data.items || []);
          setPagination(response.data.pagination || {
            page,
            limit: PAGE_SIZE,
            totalItems: 0,
            totalPages: 0,
          });
        })
        .catch((requestError) => {
          if (active) {
            setItems([]);
            setPagination({ page, limit: PAGE_SIZE, totalItems: 0, totalPages: 0 });
            setError(requestError.message || 'Unable to load content.');
          }
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, search ? 250 : 0);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [page, category, search, refreshVersion]);

  const refresh = useCallback(() => {
    setRefreshVersion((version) => version + 1);
  }, []);

  function chooseCategory(nextCategory) {
    setCategory(nextCategory);
    setPage(1);
  }

  function changeSearch(value) {
    setSearch(value);
    setPage(1);
  }

  return {
    items,
    page,
    setPage,
    category,
    chooseCategory,
    search,
    changeSearch,
    pagination,
    loading,
    error,
    setError,
    refresh,
  };
}
