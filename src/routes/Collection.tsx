import { Accordion, Divider, Heading, Box, Skeleton, VStack, Code, HStack, Spacer, Button } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { client } from "../utils/api/client";
import { useAppDispatch } from "../store/hooks";
import { setLoading } from "../features/uiSlice";
import Tomogram from "../components/tomogram";
import { parseData } from "../utils/generic";
import { CollectionData, DataConfig } from "../utils/interfaces";

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
  const [tomograms, setTomograms] = useState<Record<string, any>>([]);
  const [collectionData, setCollectionData] = useState<CollectionData>({ info: [], comments: "" });
  const [pageCount, setPageCount] = useState(1);
  const [placeholderMessage, setPlaceholderMessage] = useState("");
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const changePage = (next: boolean) => {
    navigate(`../${parseInt(params.collectionIndex ?? "1") + (next ? 1 : -1)}`, { relative: "path" });
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
    getData(`dataCollections?group=${params.groupId}&limit=1&page=${params.collectionIndex}`).then((response) => {
      if (response.total && response.items) {
        setPageCount(response.total);
        setCollectionData(parseData(response.items[0], collectionConfig) as CollectionData);
        getData(`tomograms/${response.items[0].dataCollectionId}`).then((response) => {
          if (response.items === undefined) {
            setPlaceholderMessage("No tomogram found in this data collection");
            return;
          }
          setTomograms(response.items.map((info: Record<string, any>) => parseData(info, tomogramConfig)));
        });
      }
    });
  }, [params.collectionIndex, params.groupId, getData, navigate]);

  return (
    <Box>
      <HStack>
        <VStack>
          <HStack w='100%'>
            <Heading>Data Collection #{params.collectionIndex}</Heading>
            <Heading color='diamond.300'>out of {pageCount}</Heading>
          </HStack>
          <Heading color='diamond.300' size='sm'>
            Proposal <Code>{params.propId}</Code>, visit <Code>{params.visitId}</Code>, data collection group{" "}
            <Code>{params.groupId}</Code>
          </Heading>
        </VStack>
        <Spacer />
        <Button disabled={params.collectionIndex === "1"} onClick={() => changePage(false)}>
          &lt;
        </Button>
        <Button disabled={params.collectionIndex === pageCount.toString()} onClick={() => changePage(true)}>
          &gt;
        </Button>
      </HStack>
      <Divider />
      {tomograms.length === 0 && !placeholderMessage && (
        <VStack py={3} spacing={2} h='70vh'>
          <Skeleton h='3vh' w='100%' />
          <Skeleton h='33vh' w='100%' />
          <Skeleton h='25vh' w='100%' />
        </VStack>
      )}

      {placeholderMessage && (
        <Heading textAlign='center' py={10} color='diamond.200'>
          {placeholderMessage}
        </Heading>
      )}

      <Accordion defaultIndex={0} onChange={(e) => console.log(e)}>
        {tomograms.map((tomogram: Record<string, any>) => (
          <Tomogram collectionData={collectionData} tomogram={tomogram} key={tomogram.tomogramId} />
        ))}
      </Accordion>
    </Box>
  );
};

export default Collection;
