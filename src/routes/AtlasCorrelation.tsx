import {
  Button,
  Card,
  Image,
  Divider,
  Grid,
  Heading,
  HStack,
  VStack,
  CardBody,
  useToast,
} from "@chakra-ui/react";
import { Pagination } from "@diamondlightsource/ui-components";
import { Atlas } from "components/atlas/Atlas";
import { useCallback } from "react";
import { useLoaderData, useParams, useSearchParams } from "react-router";
import { components } from "schema/main";
import { client, prependApiUrl } from "utils/api/client";
import { usePaginationSearchParams } from "utils/hooks";
import "styles/atlas.css";

type DataCollectionGroups = components["schemas"]["Paged_DataCollectionGroupSummaryResponse_"];
type DataCollectionGroup = DataCollectionGroups["items"][0];

const AtlasCorrelationPage = () => {
  const params = useParams();
  const toast = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const { page, setPage, setItemsPerPage } = usePaginationSearchParams();
  const data = useLoaderData() as DataCollectionGroups;

  const handleRowClicked = useCallback(
    (item: DataCollectionGroup) => {
      setSearchParams((prev) => ({ ...prev, correlatedId: item.dataCollectionGroupId }));
    },
    [setSearchParams]
  );

  const removeTarget = useCallback(() => {
    setSearchParams((prev) => {
      prev.delete("correlatedId");
      return prev;
    });
  }, [setSearchParams]);

  const correlatedId = searchParams.get("correlatedId");
  const onSubmit = useCallback(async () => {
    const resp = await client.post(`dataGroups/${params.groupId}/atlas/correlation`, {
      pair: correlatedId,
    });

    if (resp.status === 202) {
      toast({ status: "success", title: "Correlative alignment job successfully submitted!" });
    } else {
      toast({ status: "error", title: "Failed to submit correlative alignment job!" });
    }
  }, [correlatedId, params, toast]);

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
              <HStack>
                <Heading>Selected Pair</Heading>
                <Button onClick={removeTarget} ml='1em' bg='red'>
                  Remove
                </Button>
              </HStack>
              <Atlas groupId={correlatedId} />
            </>
          ) : (
            <>
              <Heading>Select Pair</Heading>
              <Grid gridTemplateColumns='repeat(2, minmax(300px, 1fr))' gap='0.5em'>
                {data.items.map((atlas) => (
                  <Card
                    key={atlas.dataCollectionGroupId}
                    direction={{ base: "column", sm: "row" }}
                    overflow='hidden'
                    variant='outline'
                    borderRadius='0'
                    alignItems='center'
                    onClick={() => handleRowClicked(atlas)}
                  >
                    <Image
                      maxW='190px'
                      h='90px'
                      fallbackSrc='/images/no-image.png'
                      src={prependApiUrl(`dataGroups/${atlas.dataCollectionGroupId}/atlas/image`)}
                    />

                    <VStack>
                      <CardBody py='15px' px='20px'>
                        <Heading size='sm'>{atlas.atlasPath}</Heading>
                        <Heading size='md'>{atlas.comments}</Heading>
                      </CardBody>
                    </VStack>
                  </Card>
                ))}
              </Grid>
              <Pagination
                total={data.total}
                page={page}
                limit={data.limit}
                possibleItemsPerPage={[8]}
                onPageChange={setPage}
                onItemCountChange={setItemsPerPage}
              />
            </>
          )}
        </VStack>
      </HStack>
      <VStack w='100%'>
        <Divider />
        {correlatedId && <Button onClick={onSubmit}>Submit</Button>}
      </VStack>
    </VStack>
  );
};

export default AtlasCorrelationPage;
