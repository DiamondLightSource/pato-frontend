import { Divider, Heading, HStack, Spacer, Box } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Pagination, DebouncedInput, Table } from "@diamondlightsource/ui-components";
import { usePaginationSearchParams } from "utils/hooks";

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
  const { page, setPage, setItemsPerPage, onSearch } = usePaginationSearchParams();

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
        <DebouncedInput
          onChangeEnd={onSearch}
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
