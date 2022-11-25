import { Accordion, Divider, Heading, Box, Skeleton, VStack, Code, HStack, Spacer } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { client } from "../utils/api/client";
import { useAppDispatch } from "../store/hooks";
import { setLoading } from "../features/uiSlice";
import Tomogram from "../components/tomogram";
import { parseData } from "../utils/generic";
import { CollectionData, DataConfig, TomogramData } from "../utils/interfaces";
import MotionPagination from "../components/motion/pagination";
import InfoGroup from "../components/infogroup";

const unauthorisedSubtitle =
  "...or you may not have permission to view it. If someone has sent you a direct link to this page, ask them to check whether or not you're part of the parent session.";

const collectionConfig: DataConfig = {
  include: [
    { name: "pixelSizeOnImage", unit: "μm" },
    { name: "voltage", unit: "kV" },
    { name: ["imageSizeX", "imageSizeY"], unit: "pixels", label: "Image Size" },
  ],
  root: ["comments"],
};

const tomogramConfig: DataConfig = {
  include: [
    { name: "stackFile" },
    { name: "tiltAngleOffset" },
    { name: "zShift" },
    { name: "volumeFile" },
    { name: "pixelSpacing" },
    { name: "refinedTiltAxis" },
  ],
  root: ["tomogramId"],
};

const Collection = () => {
  const params = useParams();
  const [tomograms, setTomograms] = useState<TomogramData[]>([]);
  const [collectionData, setCollectionData] = useState<CollectionData>({ info: [], comments: "" });
  const [pageCount, setPageCount] = useState(1);
  const [placeholderMessage, setPlaceholderMessage] = useState<{ title?: string; subtitle?: string } | null>(null);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const updateCollection = (page: number) => {
    navigate(`../${page}`, { relative: "path" });
  };

  const getData = useCallback(
    async (endpoint: string): Promise<Record<string, any>> => {
      let data = {};
      dispatch(setLoading(true));

      const response = await client.safe_get(endpoint);
      data = response.data;

      dispatch(setLoading(false));
      return data;
    },
    [dispatch]
  );

  useEffect(() => {
    document.title = `eBIC » Collections » ${params.collectionIndex}`;
    setTomograms([]);
    setPlaceholderMessage(null);
    getData(`dataCollections?group=${params.groupId}&limit=1&page=${params.collectionIndex}`).then((response) => {
      if (response.total && response.items) {
        setPageCount(response.total);
        setCollectionData(parseData(response.items[0], collectionConfig) as CollectionData);
        getData(`tomograms/${response.items[0].dataCollectionId}`).then((response) => {
          if (!response || response.items === undefined) {
            setPlaceholderMessage({
              title: "Tomogram not found in this data collection",
              subtitle: unauthorisedSubtitle,
            });
            return;
          }
          setTomograms(response.items.map((info: Record<string, any>) => parseData(info, tomogramConfig)));
        });
      } else {
        setPlaceholderMessage({ title: "Data collection could not be found", subtitle: unauthorisedSubtitle });
      }
    });
  }, [params.collectionIndex, params.groupId, getData, navigate]);

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack>
          <HStack w='100%'>
            <Heading>Data Collection #{params.collectionIndex}</Heading>
          </HStack>
          <Heading color='diamond.300' size='sm'>
            Proposal <Code>{params.propId}</Code>, visit <Code>{params.visitId}</Code>, data collection group{" "}
            <Code>{params.groupId}</Code>
          </Heading>
        </VStack>
        <Spacer />
        <MotionPagination size='md' onChange={updateCollection} lastAsDefault={false} total={pageCount} />
      </HStack>
      <InfoGroup py={2} cols={3} info={collectionData.info}></InfoGroup>
      <Divider />
      {tomograms.length === 0 && !placeholderMessage && (
        <VStack py={3} spacing={2} h='70vh'>
          <Skeleton h='3vh' w='100%' />
          <Skeleton h='33vh' w='100%' />
          <Skeleton h='25vh' w='100%' />
        </VStack>
      )}

      {placeholderMessage && (
        <span style={{ margin: "auto", width: "60%", display: "block" }}>
          <Heading textAlign='center' paddingTop={10} color='diamond.300'>
            {placeholderMessage.title}
          </Heading>
          <Heading fontWeight={200} size='md' textAlign='center' color='diamond.300'>
            {placeholderMessage.subtitle}
          </Heading>
        </span>
      )}

      <Accordion defaultIndex={0} onChange={(e) => console.log(e)}>
        {tomograms.map((tomogram: TomogramData) => (
          <Tomogram
            title={collectionData.comments ?? "No Title Provided"}
            tomogram={tomogram}
            key={tomogram.tomogramId}
          />
        ))}
      </Accordion>
    </Box>
  );
};

export default Collection;
