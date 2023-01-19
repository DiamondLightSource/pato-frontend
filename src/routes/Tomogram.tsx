import { Divider, Heading, Box, VStack, Code, HStack, Spacer, Checkbox, Tag } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { client } from "../utils/api/client";
import { useAppDispatch } from "../store/hooks";
import { setLoading } from "../features/uiSlice";
import { Tomogram } from "../components/tomogram/main";
import { parseData } from "../utils/generic";
import { CollectionData, DataConfig, TomogramData } from "../utils/interfaces";
import { MotionPagination } from "../components/motion/pagination";
import { InfoGroup } from "../components/visualisation/infogroup";
import { CollectionLoader } from "../components/collectionLoading";
import { buildEndpoint } from "../utils/api/endpoint";
import { collectionConfig } from "../utils/config/parse";

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
  const [tomogram, setTomogram] = useState<TomogramData | null | undefined>();
  const [collectionData, setCollectionData] = useState<CollectionData>({ info: [], comments: "" });
  const [pageCount, setPageCount] = useState(1);
  const [onlyProcessed, setOnlyProcessed] = useState(searchParams.get("onlyProcessed") === "true");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const updateCollection = useCallback(
    (page: number) => {
      navigate(`../${page}`, { relative: "path" });
    },
    [navigate]
  );

  const updateTomogramFilter = useCallback(() => {
    setOnlyProcessed(!onlyProcessed)
    setSearchParams({onlyProcessed: (!onlyProcessed).toString()})
  },[onlyProcessed, setSearchParams]
  )

  useEffect(() => {
    document.title = `eBIC » Tomograms » ${params.collectionIndex}`;
    dispatch(setLoading(true));

    /** There should be 3 possible states: a null tomogram (for when it is still being processed),
    /* and undefined tomogram (waiting for information client-side) and a valid tomogram */
    setTomogram(undefined);
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

          client.safe_get(`dataCollections/${response.data.items[0].dataCollectionId}/tomogram`).then((response) => {
            if (response.status !== 404 && response.data) {
              setTomogram(parseData(response.data, tomogramConfig) as TomogramData);
            } else {
              setTomogram(null);
            }
          });
        }
      })
      .finally(() => dispatch(setLoading(false)));
  }, [params, dispatch, navigate, updateCollection, onlyProcessed]);

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack>
          <HStack w='100%'>
            <Heading>Data Collection #{params.collectionIndex}</Heading>
            <Tag colorScheme="teal">Tomogram</Tag>
          </HStack>
          <Heading color='diamond.300' size='sm'>
            Proposal <Code>{params.propId}</Code>, visit <Code>{params.visitId}</Code>, data collection group{" "}
            <Code>{params.groupId}</Code>
          </Heading>
        </VStack>
        <Spacer />
        <VStack>
          <MotionPagination
            size='md'
            onChange={updateCollection}
            displayDefault={params.collectionIndex}
            total={pageCount}
          />
          <Checkbox defaultChecked={onlyProcessed} onChange={updateTomogramFilter} alignSelf='end'>
            Only show processed tomograms
          </Checkbox>
        </VStack>
      </HStack>
      <InfoGroup py={2} cols={3} info={collectionData.info}></InfoGroup>
      <Divider />
      {collectionData.dataCollectionId === undefined ? (
        <CollectionLoader />
      ) : (
        tomogram !== undefined && (
          <Tomogram
            title={collectionData.comments ?? "No Title Provided"}
            tomogram={tomogram}
            collection={collectionData.dataCollectionId}
          />
        )
      )}
    </Box>
  );
};

export { TomogramPage };
