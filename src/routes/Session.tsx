import { Divider, Heading, HStack, Spacer, Box, VStack, Stat, StatLabel, StatNumber } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Pagination, DebouncedInput, Table, TwoLineLink } from "@diamondlightsource/ui-components";
import { ParsedSessionReponse } from "schema/interfaces";
import { handleGroupClicked } from "loaders/session";
import { groupsHeaders } from "utils/config/table";
import { usePaginationSearchParams } from "utils/hooks";

interface LoaderData {
  items: Record<string, any>[],
  session: ParsedSessionReponse,
  total: number,
  limit: number
}

const SessionPage = () => {
  const data = useLoaderData() as LoaderData;

  const { page, setPage, setItemsPerPage, onSearch } = usePaginationSearchParams();

  const navigate = useNavigate();


  const handleRowClicked = useCallback(
    (item: Record<string, any>) => {
        navigate(handleGroupClicked(item), { relative: "path" });
    },
    [navigate]
  );

  useEffect(() => {
    document.title = "PATo » Session";
  }, []);

  return (
    <Box h='100%'>
      <Heading>Session</Heading>
      <Divider mb={4} />
      <HStack alignItems='start' gap='4em'>
        <VStack w='75%' alignItems='start'>
          <HStack mb='2em' w='100%'>
            <Stat borderBottom='3px solid' borderColor='diamond.700'>
              <StatLabel>Start Date</StatLabel>
              <StatNumber>{data.session.startDate}</StatNumber>
            </Stat>
            <Stat borderBottom='3px solid' borderColor='diamond.700'>
              <StatLabel>End Date</StatLabel>
              <StatNumber>{data.session.endDate}</StatNumber>
            </Stat>
            <Stat borderBottom='3px solid' borderColor='diamond.700'>
              <StatLabel>Beamline</StatLabel>
              <StatNumber>{data.session.microscopeName}</StatNumber>
            </Stat>
          </HStack>

          <HStack w='100%'>
            <Heading size='lg'>Data Collection Groups</Heading>
            <Spacer />
            <DebouncedInput
              onChangeEnd={onSearch}
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
            data={data.items}
            headers={groupsHeaders}
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
            <TwoLineLink title='Upload Model' isDisabled={true}>
              Upload custom model for data processing
            </TwoLineLink>
            <TwoLineLink title='Submit Feedback' href='/feedback'>
              Submit session feedback
            </TwoLineLink>
          </VStack>
        </VStack>
      </HStack>
    </Box>
  );
};

export { SessionPage };
