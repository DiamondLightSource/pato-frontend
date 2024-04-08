import { useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

/**
 * Hook providing pagination values and handlers
 */
export const usePaginationSearchParams = () => {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const page = useMemo(() => parseInt(searchParams.get("page") || "1"), [searchParams]);
  const itemsPerPage = useMemo(() => parseInt(searchParams.get("items") || "20"), [searchParams]);
  const search = useMemo(() => searchParams.get("search") || "", [searchParams]);
  const sortBy = useMemo(() => searchParams.get("sortBy"), [searchParams]);

  const updateSearchParams = useCallback(
    (newValues: Record<string, string>) => {
      const newSearchParams = new URLSearchParams({
        ...Object.fromEntries(searchParams.entries()),
        ...newValues,
      });
      navigate(
        {
          pathname: ".",
          search: newSearchParams.toString(),
        },
        { replace: true }
      );
    },
    [navigate, searchParams]
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
