import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router";

/**
 * Hook providing pagination values and handlers
 */
export const usePaginationSearchParams = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = useMemo(() => parseInt(searchParams.get("page") || "1"), [searchParams]);
  const itemsPerPage = useMemo(() => parseInt(searchParams.get("items") || "20"), [searchParams]);
  const search = useMemo(() => searchParams.get("search") || "", [searchParams]);
  const sortBy = useMemo(() => searchParams.get("sortBy"), [searchParams]);

  const updateSearchParams = useCallback(
    (newValues: Record<string, string>) => {
      setSearchParams((prev) => ({ ...Object.fromEntries(prev), ...newValues }), { replace: true });
    },
    [setSearchParams]
  );

  const onSearch = useCallback(
    (search: string) => {
      updateSearchParams({ page: "1", search: search });
    },
    [updateSearchParams]
  );

  const setSortBy = useCallback(
    (value: string) => {
      updateSearchParams({ sortBy: value });
    },
    [updateSearchParams]
  );

  const setPage = useCallback(
    (value: number) => {
      updateSearchParams({ page: value.toString() });
    },
    [updateSearchParams]
  );

  const setItemsPerPage = useCallback(
    (value: number) => {
      updateSearchParams({ items: value.toString() });
    },
    [updateSearchParams]
  );

  return { page, itemsPerPage, search, sortBy, setPage, setSortBy, setItemsPerPage, onSearch };
};
