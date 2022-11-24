import { Divider, Heading, HStack, Input, Spacer, Table, Tbody, Td, Th, Thead, Tr, useToast } from "@chakra-ui/react";
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
  routeKeys: string[];
}

const GenericListing = ({ headers, endpoint, heading, routeKeys }: TableProps) => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(10);
  const [itemsPerPage, setItemsPerPage] = useState(20);
  const [search, setSearch] = useState("");

  const toast = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useAppDispatch();

  const getRouteKey = (item: Record<string, any>) => {
    return routeKeys.map((key) => item[key]).join("");
  };

  useEffect(() => {
    document.title = `eBIC » ${heading}`;
  }, [heading]);

  useEffect(() => {
    dispatch(setLoading(true));
    let builtEndpoint = buildEndpoint(`${endpoint}`, params, itemsPerPage, page);

    if (search) {
      builtEndpoint += `&s=${search}`;
    }

    client
      .safe_get(builtEndpoint)
      .then((response) => {
        if (response.data.items !== undefined) {
          setTotal(response.data.total);
          setData(response.data.items);
        }
      })
      .catch((response) => {
        if (response.redirect) {
          navigate(response.redirect, { state: { redirect: true } });
        }
      })
      .finally(() => dispatch(setLoading(false)));
  }, [page, itemsPerPage, toast, endpoint, navigate, dispatch, search, params]);

  return (
    <div>
      <HStack>
        <Heading>{heading}</Heading>
        <Spacer />
        <Input
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
      {data === undefined || data.length === 0 ? (
        <Heading py={4} w='100%' textAlign='center' color='diamond.200'>
          No {heading.toLowerCase()} found
        </Heading>
      ) : (
        <div>
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
                <Tr key={i} onClick={() => navigate(getRouteKey(item))}>
                  {headers.map((header) => (
                    <Td key={header.key}>{item[header.key]}</Td>
                  ))}
                </Tr>
              ))}
            </Tbody>
          </Table>
          <Pagination
            onChange={(page, itemAmount) => {
              setItemsPerPage(itemAmount);
              setPage(page);
            }}
            total={total}
          />
        </div>
      )}
    </div>
  );
};

export default GenericListing;
