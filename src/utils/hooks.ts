import { useCallback, useEffect, useState } from "react";
import { createSearchParams, useNavigate, useSearchParams } from "react-router-dom";

/**
 * Hook providing pagination values and handlers
 */
export const usePaginationSearchParams = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get("items") || "20"));
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const onSearch = useCallback((search: string) => {
    setPage(1);
    setSearch(search);
  }, []);

  useEffect(
    () =>
      navigate(
        {
          pathname: ".",
          search: `?${createSearchParams({
            search: search,
            page: page.toString(),
            items: itemsPerPage.toString(),
          })}`,
        },
        { replace: true }
      ),
    [search, page, itemsPerPage, navigate]
  );

  return { page, itemsPerPage, search, setPage, setItemsPerPage, onSearch };
};
