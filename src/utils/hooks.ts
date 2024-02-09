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
  const [sortBy, setSortBy] = useState(searchParams.get("sortBy"));

  const onSearch = useCallback((search: string) => {
    setPage(1);
    setSearch(search);
  }, []);

  useEffect(() => {
    const newSearchParams = createSearchParams({
      search: search,
      page: page.toString(),
      items: itemsPerPage.toString(),
    });

    if (sortBy) {
      newSearchParams.set("sortBy", sortBy);
    }

    navigate(
      {
        pathname: ".",
        search: newSearchParams.toString(),
      },
      { replace: true }
    );
  }, [search, page, itemsPerPage, sortBy, navigate]);

  return { page, itemsPerPage, search, sortBy, setPage, setSortBy, setItemsPerPage, onSearch };
};
