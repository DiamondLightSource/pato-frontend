import {
  Divider,
  Heading,
  HStack,
  Spacer,
  Box,
  Select,
  Text,
  Image,
  Card,
  CardBody,
  Grid,
  VStack,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { Link, useLoaderData } from "react-router";
import { Pagination, DebouncedInput } from "@diamondlightsource/ui-components";
import { usePaginationSearchParams } from "utils/hooks";
import { Options } from "components/form/input";
import { prependApiUrl } from "utils/api/client";
import { components } from "schema/main";

const SORT_OPTIONS = [
  { key: "dataCollectionId", value: "Most Recent" },
  { key: "globalAlignmentQuality", value: "Alignment Quality" },
];

interface TomogramListLoaderData {
  data: components["schemas"]["DataCollectionSummary"][];
  total: number;
  limit: number;
}

const TomogramCard = ({ title, value }: { title: string; value?: string | number | null }) => (
  <HStack flex='1 0 auto'>
    <Text fontWeight='600'>{title} :</Text>
    <Text>{value ?? "?"}</Text>
  </HStack>
);

const TomogramList = () => {
  const data = useLoaderData() as TomogramListLoaderData;
  const { search, page, sortBy, setPage, setItemsPerPage, setSortBy, onSearch } =
    usePaginationSearchParams();

  useEffect(() => {
    document.title = `PATo » Tomograms`;
  }, []);

  return (
    <Box h='100%'>
      <HStack>
        <Heading>Tomograms</Heading>
        <Spacer />
        <Text id='sort-by-label'>Sort By</Text>
        <Select
          defaultValue={sortBy ?? 0}
          aria-labelledby='sort-by-label'
          variant='hi-contrast'
          size='sm'
          w={{ base: "auto", md: "20%" }}
          onChange={(e) => setSortBy(e.target.value)}
        >
          <Options values={SORT_OPTIONS} />
        </Select>
        <DebouncedInput
          onChangeEnd={onSearch}
          variant='hi-contrast'
          w={{ base: "auto", md: "20%" }}
          size='sm'
          placeholder='Search...'
          defaultValue={search}
        />
      </HStack>
      <Divider mb={4} />
      {data.data && data.data.length > 0 ? (
        <Grid gridTemplateColumns='repeat(auto-fit, minmax(600px, 1fr))' gap='0.5em'>
          {data.data.map((collection) => (
            <Card
              key={collection.dataCollectionId}
              direction={{ base: "column", sm: "row" }}
              overflow='hidden'
              variant='outline'
              borderRadius='0'
              as={Link}
              to={`../tomograms/${collection.index}${sortBy ? "?sortBy=" : ""}${sortBy ?? ""}`}
              relative='path'
            >
              <Image
                h='90px'
                fallbackSrc='/images/no-image.png'
                src={prependApiUrl(`dataCollections/${collection.dataCollectionId}/centralSlice`)}
              />

              <VStack>
                <CardBody py='15px' px='20px'>
                  <HStack>
                    <Heading size='md'>{collection.comments}</Heading>
                    <Text>
                      {collection.startTime ?? "?"} - {collection.endTime ?? "?"}
                    </Text>
                  </HStack>

                  <HStack pt='10px'>
                    <TomogramCard
                      title='Alignment Quality'
                      value={collection.globalAlignmentQuality}
                    />
                    <TomogramCard title='Tomograms' value={collection.tomograms} />
                    <TomogramCard title='Run Status' value={collection.runStatus} />
                  </HStack>
                </CardBody>
              </VStack>
            </Card>
          ))}
        </Grid>
      ) : (
        <Heading pt={5} variant='notFound'>
          No Tomograms Found
        </Heading>
      )}
      <Divider />
      {data.data !== null && data.data.length > 0 && (
        <Pagination
          limit={data.limit}
          page={page}
          onPageChange={setPage}
          onItemCountChange={setItemsPerPage}
          total={data.total}
        />
      )}
    </Box>
  );
};

export { TomogramList };
