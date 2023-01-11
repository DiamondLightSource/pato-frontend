import {
  Divider,
  Heading,
  HStack,
  Input,
  Spacer,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  useToast,
  Box,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../components/pagination";
import { setLoading } from "../features/uiSlice";
import { useAppDispatch } from "../store/hooks";
import { client } from "../utils/api/client";
import { buildEndpoint } from "../utils/api/endpoint";

interface TableProps {
  headers: {
    key: string;
    label: string;
  }[];
  endpoint: string;
  heading: string;
  makePathCallback?: (item: Record<string, string | number>) => string;
}

const GenericListing = ({ headers, endpoint, heading, makePathCallback }: TableProps) => {
  const [data, setData] = useState<Array<Record<string, string | number>>>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(10);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [search, setSearch] = useState("");

  const toast = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.title = `eBIC » ${heading}`;
  }, [heading]);

  useEffect(() => {
    dispatch(setLoading(true));
    let builtEndpoint = buildEndpoint(`${endpoint}`, params, itemsPerPage, page);

    if (search) {
      builtEndpoint += `&search=${search}`;
    }

    client
      .safe_get(builtEndpoint)
      .then((response) => {
        if (response.data && response.data.items !== undefined) {
          setTotal(response.data.total);
          setData(response.data.items);
        }
      })
      .finally(() => dispatch(setLoading(false)));
  }, [page, itemsPerPage, toast, endpoint, navigate, dispatch, search, params]);

  return (
    <Box h='100%'>
      <HStack>
        <Heading>{heading}</Heading>
        <Spacer />
        <Input
          bg='diamond.50'
          onKeyUp={(e) => {
            if (e.key === "Enter") {
              setSearch(e.currentTarget.value);
            }
          }}
          onBlur={(e) => setSearch(e.currentTarget.value)}
          w='20%'
          size='sm'
          placeholder='Search'
        ></Input>
      </HStack>
      <Divider />
      <Box overflow='scroll'>
        {data === undefined || data.length === 0 ? (
          <Heading py={10} w='100%' variant='notFound'>
            No {heading.toLowerCase()} found
          </Heading>
        ) : (
          <Table size='sm' variant='diamondStriped'>
            <Thead>
              <Tr>
                {headers.map((header) => (
                  <Th key={header.label}>{header.label}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody cursor='pointer'>
              {data.map((item, i) => (
                <Tr
                  h='2vh'
                  key={i}
                  onClick={() => {
                    if (makePathCallback) {
                      navigate(makePathCallback(item));
                    }
                  }}
                >
                  {headers.map((header) => (
                    <Td key={header.key}>{item[header.key]}</Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
        )}
      </Box>
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

export default GenericListing;
