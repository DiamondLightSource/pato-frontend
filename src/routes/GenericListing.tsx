import { Divider, Heading, HStack, Input, Spacer, Table, Tbody, Td, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Pagination from "../components/pagination";
import { setLoading } from "../features/uiSlice";
import { useAppDispatch } from "../store/hooks";
import { baseToast } from "../styles/components";
import { client } from "../utils/api/client";
import { buildEndpoint } from "../utils/api/endpoint";

interface TableProps {
  headers: {
    key: string;
    label: string;
  }[];
  endpoint: string;
  heading: string;
  routeKey: string;
}

const GenericListing = ({ headers, endpoint, heading, routeKey }: TableProps) => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(10);
  const [itemsPerPage, setItemsPerPage] = useState(20);

  const toast = useToast();
  const navigate = useNavigate();
  const params = useParams();
  const dispatch = useAppDispatch();

  endpoint = buildEndpoint(endpoint, params);

  useEffect(() => {
    dispatch(setLoading(true));
    client
      .get(`${endpoint}?limit=${itemsPerPage}&page=${page}`)
      .then((response) => {
        setTotal(response.data.total);
        setData(response.data.data);
      })
      .catch((response) => {
        if (response.detail === "Could not validate token") {
          toast({
            ...baseToast,
            title: "Error!",
            description: "Your session is invalid, please log in to access this page.",
            status: "error",
          });
          navigate("/login", { state: { redirect: true } });
          return;
        }
        toast({
          ...baseToast,
          title: "Error!",
          description: "An error occurred and data could not be retrieved. Please try again.",
          status: "error",
        });
      })
      .finally(() => dispatch(setLoading(false)));
  }, [page, itemsPerPage, toast, endpoint, navigate, dispatch]);

  return (
    <div>
      <HStack>
        <Heading>{heading}</Heading>
        <Spacer />
        <Input w='20%' size='sm' placeholder='Search'></Input>
      </HStack>
      <Divider />
      <Table size='sm' variant='striped'>
        <Thead>
          <Tr>
            {headers.map((header) => (
              <Th key={header.label}>{header.label}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((item, i) => (
            <Tr key={i} onClick={() => navigate(item[routeKey].toString())}>
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
  );
};

export default GenericListing;
