import { Divider, Heading, HStack, Spacer, useToast, Box } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pagination } from "../components/navigation/pagination";
import { client } from "../utils/api/client";
import { buildEndpoint } from "../utils/api/endpoint";
import { Table } from "../components/visualisation/table";
import { DebouncedInput } from "../components/input/debounced";

interface TableProps {
  headers: {
    key: string;
    label: string;
  }[];
  endpoint: string;
  heading: string;
  makePathCallback?: (item: Record<string, string | number>, index: number) => string;
  processData?: (data: Record<string, any>[]) => Record<string, any>[];
}

const GenericListing = ({ headers, endpoint, heading, makePathCallback, processData }: TableProps) => {
  const [data, setData] = useState<Array<Record<string, string | number>> | null>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(10);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [search, setSearch] = useState("");

  const toast = useToast();
  const navigate = useNavigate();
  const params = useParams();

  const handleSearch = useCallback((search: string) => {
    setPage(1);
    setSearch(search);
  }, []);

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

  useEffect(() => {
    let builtEndpoint = buildEndpoint(`${endpoint}`, params, itemsPerPage, page);

    if (search) {
      builtEndpoint += `&search=${search}`;
    }

    client.safe_get(builtEndpoint).then((response) => {
      if (response.data && response.data.items !== undefined) {
        setTotal(response.data.total);

        if (processData) {
          setData(processData(response.data.items));
        } else {
          setData(response.data.items);
        }
      } else {
        setTotal(0);
        setData(null);
      }
    });
  }, [page, itemsPerPage, toast, endpoint, navigate, processData, search, params]);

  return (
    <Box h='100%'>
      <HStack>
        <Heading>{heading}</Heading>
        <Spacer />
        <DebouncedInput
          borderColor='gray.600'
          bg='diamond.50'
          onChangeEnd={handleSearch}
          w='20%'
          size='sm'
          placeholder='Search...'
        />
      </HStack>
      <Divider mb={4} />
      <Table data={data} headers={headers} label={heading} onClick={handleRowClicked} />
      <Divider />
      <Pagination value={page} onPageChange={setPage} onItemCountChange={setItemsPerPage} total={total} />
    </Box>
  );
};

export { GenericListing };
