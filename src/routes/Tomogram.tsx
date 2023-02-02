import {
  Divider,
  Heading,
  Box,
  VStack,
  Code,
  HStack,
  Spacer,
  Checkbox,
  Tag,
  Icon,
  Button,
  Tooltip,
  Accordion,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { client } from "../utils/api/client";
import { Tomogram } from "../components/tomogram/main";
import { parseData } from "../utils/generic";
import { CollectionData, DataConfig, TomogramData } from "../schema/interfaces";
import { MotionPagination } from "../components/motion/pagination";
import { InfoGroup } from "../components/visualisation/infogroup";
import { CollectionLoader } from "../components/collectionLoading";
import { buildEndpoint } from "../utils/api/endpoint";
import { collectionConfig } from "../utils/config/parse";
import { MdList } from "react-icons/md";
import { Motion } from "../components/motion/motion";
import { components } from "../schema/main";

type TomogramResponse = components["schemas"]["Tomogram"];

const tomogramConfig: DataConfig = {
  include: [
    { name: "stackFile" },
    { name: "tiltAngleOffset", unit: "°" },
    { name: "zShift" },
    { name: "volumeFile" },
    { name: "pixelSpacing" },
    { name: "refinedTiltAxis", unit: "°" },
  ],
  root: ["tomogramId"],
};

const TomogramPage = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tomograms, setTomograms] = useState<TomogramData[] | null | undefined>();
  const [collectionData, setCollectionData] = useState<CollectionData>({ info: [], comments: "" });
  const [pageCount, setPageCount] = useState(1);
  const [onlyProcessed, setOnlyProcessed] = useState(searchParams.get("onlyProcessed") === "true");
  const [accordionIndex, setAccordionIndex] = useState<number | number[]>(0);
  const navigate = useNavigate();

  const updateCollection = useCallback(
    (page: number) => {
      navigate(`../${page}`, { relative: "path" });
    },
    [navigate]
  );

  const updateTomogramFilter = useCallback(() => {
    setOnlyProcessed(!onlyProcessed);
    setSearchParams({ onlyProcessed: (!onlyProcessed).toString() });
  }, [onlyProcessed, setSearchParams]);

  useEffect(() => {
    document.title = `PATo » Tomograms » ${params.collectionIndex}`;

    /** There should be 3 possible states: a null tomogram (for when it is still being processed),
    /* and undefined tomogram (waiting for information client-side) and a valid tomogram */
    setTomograms(undefined);
    client
      .safe_get(
        `${buildEndpoint(
          "dataCollections",
          params,
          1,
          parseInt(params.collectionIndex ?? "1")
        )}&onlyTomograms=${onlyProcessed}`
      )
      .then((response) => {
        if (response.data.total && response.data.items) {
          setPageCount(response.data.total);
          if (params.collectionIndex && params.collectionIndex > response.data.total) {
            updateCollection(1);
          }
          setCollectionData(parseData(response.data.items[0], collectionConfig) as CollectionData);

          client.safe_get(`dataCollections/${response.data.items[0].dataCollectionId}/tomograms`).then((response) => {
            if (response.status !== 404 && response.data) {
              const items = response.data.items as TomogramResponse[];
              setTomograms(items.map((item) => parseData(item, tomogramConfig) as TomogramData));
            } else {
              setTomograms(null);
            }
          });
        }
      });
  }, [params, navigate, updateCollection, onlyProcessed]);

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack w='100%'>
          <HStack w='100%'>
            <Heading>Data Collection #{params.collectionIndex}</Heading>
            <Tag colorScheme='teal'>Tomogram</Tag>
            <Spacer />
            <Tooltip label='List Collections'>
              <Button onClick={() => navigate("../../collections", { relative: "path" })}>
                <Icon as={MdList} />
              </Button>
            </Tooltip>
            <Divider orientation='vertical' h='5vh' />
            <MotionPagination
              size='md'
              onChange={updateCollection}
              displayDefault={parseInt(params.collectionIndex ?? "1")}
              total={pageCount}
            />
          </HStack>
          <HStack w='100%'>
            <Heading color='diamond.300' size='sm'>
              Proposal <Code>{params.propId}</Code>, visit <Code>{params.visitId}</Code>, data collection group{" "}
              <Code>{params.groupId}</Code>
            </Heading>
            <Spacer />
            <Checkbox defaultChecked={onlyProcessed} onChange={updateTomogramFilter} alignSelf='end'>
              Only show processed tomograms
            </Checkbox>
          </HStack>
        </VStack>
      </HStack>
      <InfoGroup py={2} cols={3} info={collectionData.info}></InfoGroup>
      <Divider mb={3} />
      {tomograms ? (
        <Accordion onChange={setAccordionIndex} index={accordionIndex} allowToggle>
          {tomograms.map((tomogram, i) => (
            <Tomogram key={tomogram.tomogramId} tomogram={tomogram} active={accordionIndex === i} title='test' />
          ))}
        </Accordion>
      ) : (
        <span>
          {collectionData.dataCollectionId ? (
            <Motion parentType={"dataCollections"} parentId={collectionData.dataCollectionId} />
          ) : (
            <CollectionLoader />
          )}
        </span>
      )}
    </Box>
  );
};

export { TomogramPage };
