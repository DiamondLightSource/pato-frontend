import {
  Divider,
  Heading,
  HStack,
  Spacer,
  Box,
  VStack,
  Link,
  Text,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { createSearchParams, useLoaderData, useNavigate, useSearchParams } from "react-router-dom";
import { Pagination, DebouncedInput, Table } from "@diamondlightsource/ui-components";
import { Link as LinkRouter } from "react-router-dom";
import { client } from "utils/api/client";

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

export interface LinkWithDescriptionProps {
  to: string;
  heading: string;
  children: string;
}

const LinkWithDescription = ({ to, heading, children }: LinkWithDescriptionProps) => (
  <VStack alignItems='start'>
    <Link as={LinkRouter} to={to} fontWeight='600' color='diamond.700' fontSize='20px'>
      {heading}
    </Link>
    <Text fontSize='16px'>{children}</Text>
    <Divider />
  </VStack>
);

const SessionPage = ({ headers, heading, makePathCallback }: TableProps) => {
  const data = useLoaderData() as TableData;
  const [searchParams] = useSearchParams();
  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1"));
  const [itemsPerPage, setItemsPerPage] = useState(parseInt(searchParams.get("items") || "20"));
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const navigate = useNavigate();

  useEffect(() => {
    client.get("/proposals/cm33915/sessions/1").then((response) => console.log(response));
  }, []);

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
    document.title = "PATo » Session";
  }, [heading]);

  return (
    <Box h='100%'>
      <Heading>Session</Heading>
      <Divider mb={4} />
      <HStack alignItems='start' gap='4em'>
        <VStack w='75%' alignItems='start'>
          <HStack mb='2em' w='100%'>
            <Stat borderBottom='3px solid' borderColor='diamond.700'>
              <StatLabel>Start Date</StatLabel>
              <StatNumber>2023/02/11</StatNumber>
            </Stat>
            <Stat borderBottom='3px solid' borderColor='diamond.700'>
              <StatLabel>End Date</StatLabel>
              <StatNumber>2023/02/11</StatNumber>
            </Stat>
            <Stat borderBottom='3px solid' borderColor='diamond.700'>
              <StatLabel>Beamline</StatLabel>
              <StatNumber>Krios I</StatNumber>
            </Stat>
          </HStack>

          <HStack w='100%'>
            <Heading size='lg'>Data Collection Groups</Heading>
            <Spacer />
            <DebouncedInput
              onChangeEnd={handleSearch}
              borderColor='gray.600'
              bg='diamond.50'
              w={{ base: "auto", md: "40%" }}
              size='sm'
              placeholder='Search...'
            />
          </HStack>
          <Divider mb={4} />
          <Table
            w='100%'
            data={data.data}
            headers={headers}
            label='data collection groups'
            onClick={handleRowClicked}
          />
          <Divider />
          <Pagination
            limit={data.limit}
            page={page}
            onPageChange={setPage}
            onItemCountChange={setItemsPerPage}
            total={data.total}
            w='100%'
          />
        </VStack>
        <VStack alignItems='start'>
          <VStack alignItems='start'>
            <Heading size='lg'>Actions</Heading>
            <Divider />
            <LinkWithDescription to='' heading='Upload Model'>
              Upload custom model for data processing
            </LinkWithDescription>
            <LinkWithDescription to='' heading='Submit Feedback'>
              Submit session feedback
            </LinkWithDescription>
          </VStack>
        </VStack>
      </HStack>
    </Box>
  );
};

export { SessionPage };
