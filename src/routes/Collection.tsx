import { Accordion, Divider, Heading, Box, Skeleton, VStack } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { client } from "../utils/api/client";
import { useAppDispatch } from "../store/hooks";
import { setLoading } from "../features/uiSlice";
import Tomogram from "../components/tomogram";
import { parseData } from "../utils/generic";

const Collection = () => {
  const params = useParams();
  const [tomograms, setTomograms] = useState<Record<string, any>>([]);
  const [placeholderMessage, setPlaceholderMessage] = useState("");
  const dispatch = useAppDispatch();

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
    document.title = `eBIC » Collections » ${params.collectionId}`;
    getData(`tomograms/${params.collectionId}`).then((response) => {
      if (response.items === undefined) {
        setPlaceholderMessage("No tomogram found in this data collection");
        return;
      }
      setTomograms(response.items.map((info: Record<string, any>) => parseData(info, ["tomogramId"])));
    });
  }, [params.collectionId, getData]);

  return (
    <Box>
      <Heading>
        Data Collection {params.collectionId} for {params.propId}-{params.visitId}
      </Heading>
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
          <Tomogram tomogram={tomogram} key={tomogram.tomogramId} />
        ))}
      </Accordion>
    </Box>
  );
};

export default Collection;
