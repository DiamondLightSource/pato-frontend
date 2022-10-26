import { Divider, Heading, HStack, Input, Spacer, Table, Tbody, Td, Th, Thead, Tr, useToast } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Pagination from "../components/pagination";
import { baseToast } from "../styles/components";
import { client } from "../utils/api/client";

interface ProposalData {
  proposalId: string;
  title: string;
  proposalCode: string;
}

const getData = async (page: number, itemsPerPage: number) => {
  const response = await client.get(`proposals?limit=${itemsPerPage}`);
  return response.data;
};

const Proposals = () => {
  const [data, setData] = useState<Array<ProposalData>>([]);
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);

  const toast = useToast();

  useEffect(() => {
    getData(page, itemsPerPage)
      .then((apiData) => setData(apiData))
      .catch(() => {
        toast({
          ...baseToast,
          title: "Error!",
          description: "An error occurred and data could not be retrieved. Please try again.",
          status: "error",
        });
      });
    //.finally(() => setLoading(false));
  }, [page, itemsPerPage, toast]);

  return (
    <div>
      <HStack>
        <Heading>Proposals</Heading>
        <Spacer />
        <Input w='20%' size='sm' placeholder='Search'></Input>
      </HStack>
      <Divider />
      <Table size='sm' variant='striped'>
        <Thead>
          <Tr>
            <Th>Code</Th>
            <Th>Number</Th>
            <Th>Visits</Th>
            <Th>Title</Th>
          </Tr>
        </Thead>
        <Tbody>
          {data.map((proposal) => (
            <Tr key={[proposal.proposalId, proposal.proposalCode].join("")}>
              <Td>{proposal.proposalCode}</Td>
              <Td>{proposal.proposalId}</Td>
              <Td></Td>
              <Td>{proposal.title}</Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
      <Pagination
        onChange={(page, itemAmount) => {
          setItemsPerPage(itemAmount);
          setPage(page);
        }}
        total={35}
      />
    </div>
  );
};

export default Proposals;
