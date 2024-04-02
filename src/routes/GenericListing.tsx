import { Divider, Heading, HStack, Spacer, Box, Select, Text } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Pagination, DebouncedInput, Table } from "@diamondlightsource/ui-components";
import { usePaginationSearchParams } from "utils/hooks";
import { Option, Options } from "components/form/input";

export interface TableProps {
  headers: {
    key: string;
    label: string;
  }[];
  heading: string;
  /** Valid sorting values */
  sortOptions?: Option[];
  makePathCallback?: (item: Record<string, string | number>, index: number) => string;
}

interface TableData {
  data: Array<Record<string, number | string>> | null;
  total: number;
  limit: number;
}

const GenericListing = ({ headers, heading, sortOptions, makePathCallback }: TableProps) => {
  const data = useLoaderData() as TableData;
  const { search, page, sortBy, setPage, setItemsPerPage, setSortBy, onSearch } =
    usePaginationSearchParams();

  const navigate = useNavigate();

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
        {sortOptions && (
          <>
            <Text id='sort-by-label'>Sort By</Text>
            <Select
              defaultValue={sortBy ?? 0}
              aria-labelledby='sort-by-label'
              variant='hi-contrast'
              size='sm'
              w={{ base: "auto", md: "20%" }}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <Options values={sortOptions} />
            </Select>
          </>
        )}
        <DebouncedInput
          onChangeEnd={onSearch}
          variant='hi-contrast'
          w={{ base: "auto", md: "20%" }}
          size='sm'
          placeholder='Search...'
          defaultValue={search}
        />
      </HStack>
      <Divider mb={4} />
      <Table data={data.data} headers={headers} label={heading} onClick={handleRowClicked} />
      <Divider />
      <Pagination
        limit={data.limit}
        page={page}
        onPageChange={setPage}
        onItemCountChange={setItemsPerPage}
        total={data.total}
      />
    </Box>
  );
};

export { GenericListing };
