import { Divider, Heading, HStack, Input, Spacer, useToast, Box } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Pagination } from "../components/navigation/pagination";
import { client } from "../utils/api/client";
import { buildEndpoint } from "../utils/api/endpoint";
import { Table } from "../components/visualisation/table";

interface TableProps {
  headers: {
    key: string;
    label: string;
  }[];
  endpoint: string;
  heading: string;
  makePathCallback?: (item: Record<string, string | number>) => string;
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

  const handleRowClicked = useCallback(
    (item: Record<string, any>) => {
      if (makePathCallback) {
        navigate(makePathCallback(item));
      }
    },
    [makePathCallback, navigate]
  );

  useEffect(() => {
    document.title = `eBIC » ${heading}`;
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
        <Input
          borderColor='gray.600'
          bg='diamond.50'
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              setSearch(e.currentTarget.value);
            }
          }}
          onBlur={(e) => setSearch(e.currentTarget.value)}
          w='20%'
          size='sm'
          placeholder='Search...'
        ></Input>
      </HStack>
      <Divider />
      <Table data={data} headers={headers} label={heading} onClick={handleRowClicked} />
      <Divider />
      <Pagination
        onChange={(page, itemAmount) => {
          setItemsPerPage(itemAmount);
          setPage(page);
        }}
        total={total}
      />
    </Box>
  );
};

export { GenericListing };
