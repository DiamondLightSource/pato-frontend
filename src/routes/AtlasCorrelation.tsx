import { Button, Card, Image, Divider, Grid, Heading, HStack, Link, VStack, CardBody } from "@chakra-ui/react";
import { Pagination, Table } from "@diamondlightsource/ui-components";
import { Atlas } from "components/atlas/Atlas";
import { GridSquare } from "components/atlas/GridSquare";
import { SearchMap } from "components/atlas/SearchMap";
import { ColourChannelSelector } from "components/clem/ColourChannelSelector";
import { ClemROIs } from "components/clem/ROI";
import { AtlasResponse } from "loaders/atlas";
import { useCallback, useMemo, useState } from "react";
import { useLoaderData, useParams, useSearchParams } from "react-router";
import { components } from "schema/main";
import { prependApiUrl } from "utils/api/client";
import { getAvailableColours } from "utils/generic";
import { usePaginationSearchParams } from "utils/hooks";

type DataCollectionGroups = components["schemas"]["Paged_DataCollectionGroupSummaryResponse_"];
type DataCollectionGroup = DataCollectionGroups["items"][0];

const AtlasCorrelationPage = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, setPage, setItemsPerPage, onSearch } = usePaginationSearchParams();
  const data = useLoaderData() as DataCollectionGroups;

  const handleRowClicked = useCallback((item: DataCollectionGroup) => {
    setSearchParams((prev) => ({ ...prev, correlatedId: item.dataCollectionGroupId}));
  }, [setSearchParams]);

  const correlatedId = searchParams.get("correlatedId");

  return (
    <VStack alignItems='start'>
      <Heading pr='0.5em'>Atlas Correlation</Heading>
      <Divider />
      <HStack w='100%' h='100%' alignItems='start' flexWrap='wrap'>
        <VStack flex='1 0 0'>
            <Heading>Source</Heading>
          <Atlas groupId={params.groupId!} />
        </VStack>
        <VStack flex='1 0 0'>
          {correlatedId ? (
            <>
            <HStack><Heading>Selected Pair</Heading><Button ml="1em" bg="red">Remove</Button></HStack>
            <Atlas groupId={correlatedId} />
            </>
          ) : (
            <>
              <Heading>Select Pair</Heading>
        <Grid gridTemplateColumns='repeat(2, minmax(300px, 1fr))' gap='0.5em'>
          {data.items.map((atlas) => <Card
              key={atlas.dataCollectionGroupId}
              direction={{ base: "column", sm: "row" }}
              overflow='hidden'
              variant='outline'
              borderRadius='0'
              onClick={() => handleRowClicked(atlas)}
            >
              <Image
                maxW='190px'
                h='90px'
                fallbackSrc='/images/no-image.png'
                src={prependApiUrl(`/dataGroups/${atlas.dataCollectionGroupId}/atlas/image`)}
              />

              <VStack>
                <CardBody py='15px' px='20px'>
                  <Heading size='md'>{atlas.atlasId}</Heading>
                  <Heading size='md'>{atlas.comments}</Heading>
                </CardBody>
              </VStack>
            </Card>
          )}
          </Grid>
              <Pagination
                total={data.total}
                page={page}
                limit={data.limit}
                possibleItemsPerPage={[5]}
                onPageChange={setPage}
                onItemCountChange={setItemsPerPage}
              />
            </>
          )}
        </VStack>
      </HStack>
      <VStack w="100%">
        <Divider/>
        {correlatedId && 
            <Button>Submit</Button>}
          </VStack>
    </VStack>
  );
};

export default AtlasCorrelationPage;
