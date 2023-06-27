import { Divider, Heading, HStack, Spacer, Box } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { createSearchParams, useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { Pagination, DebouncedInput } from "diamond-components";
import { Table } from "components/visualisation/table";

export interface TableProps {
  headers: {
    key: string;
    label: string;
  }[];
  heading: string;
  makePathCallback?: (item: Record<string, string | number>, index: number) => string;
}

interface TableData {
  data: Array<Record<string, number | string>> | null;
  total: number;
  limit: number;
}

const GenericListing = ({ headers, heading, makePathCallback }: TableProps) => {
  const data = useLoaderData() as TableData;
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get("items") || "20"));
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const navigate = useNavigate();

  const handleSearch = useCallback((search: string) => {
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

  const handleRowClicked = useCallback(
    (item: Record<string, any>, index: number) => {
      if (makePathCallback) {
        navigate(makePathCallback(item, index), { relative: "path" });
      }
    },
    [makePathCallback, navigate]
  );

  useEffect(() => {
    document.title = `PATo » ${heading}`;
  }, [heading]);

  return (
    <Box h='100%'>
      <HStack>
        <Heading>{heading}</Heading>
        <Spacer />
        <DebouncedInput
          onChangeEnd={handleSearch}
          borderColor='gray.600'
          bg='diamond.50'
          w={{ base: "auto", md: "20%" }}
          size='sm'
          placeholder='Search...'
        />
      </HStack>
      <Divider mb={4} />
      <Table data={data.data} headers={headers} label={heading} onClick={handleRowClicked} />
      <Divider />
      {data.total ? (
        <Pagination
          limit={data.limit}
          value={page}
          onPageChange={setPage}
          onItemCountChange={setItemsPerPage}
          total={data.total}
        />
      ) : null}
    </Box>
  );
};

export { GenericListing };
