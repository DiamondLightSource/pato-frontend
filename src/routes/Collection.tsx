import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Divider,
  Grid,
  GridItem,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Scatter from "../components/scatter";
import Image from "../components/image";
import { client } from "../utils/api/client";
import InfoGroup, { Info } from "../components/infogroup";
import { baseToast } from "../styles/components";
import { useAppDispatch } from "../store/hooks";
import { setLoading } from "../features/uiSlice";

interface WindowDimensions {
  width: number;
  height: number;
}

interface ApiData {
  motion: Info[];
  drift: { x: number; y: number }[];
}

const getData = async (collectionId: string) => {
  const response = await client.get(`motion/${collectionId}`);
  const summary = response.data.data[0];
  let motion: Info[] = [];

  if (response.data.data.length > 0) {
    for (let key in response.data.data[0]) {
      motion.push({ label: key, value: summary[key] });
    }
  }
  return {
    drift: [{ x: 1, y: 1 }],
    motion: motion,
  };
};

const useGridSize = (gridSize: number) => {
  const [windowSize, setWindowSize] = useState<WindowDimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth / gridSize + 30,
        height: window.innerHeight / gridSize + 30,
      });
    }
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [gridSize]);

  return windowSize;
};

const Collection = () => {
  const params = useParams();
  const [data, setData] = useState<ApiData>({ motion: [], drift: [] });
  const size = useGridSize(6);
  const dispatch = useAppDispatch();
  const toast = useToast();

  useEffect(() => {
    dispatch(setLoading(true));
    getData(params.collectionId || "")
      .then((apiData) => {
        return setData(apiData);
      })
      .catch(() => {
        toast({
          ...baseToast,
          title: "Error!",
          description: "An error occurred and data could not be retrieved. Please try again.",
          status: "error",
        });
      })
      .finally(() => dispatch(setLoading(false)));
  }, [params.collectionId, toast, dispatch]);

  return (
    <Box>
      <Heading>
        Data Collection {params.collectionId} for {params.propId}-{params.visitId}
      </Heading>
      <Divider />
      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionItem>
          <h2>
            <AccordionButton bg='diamond.100'>
              <Box flex='1' textAlign='left'>
                Processing Job
              </Box>
              <AccordionIcon />
            </AccordionButton>
          </h2>
          <AccordionPanel>
            <Heading size='md'>Summary</Heading>
            <Divider />
            <Grid p={2} templateColumns='repeat(3, 1fr)' gap={2}>
              <GridItem>
                <Scatter title='Astigmatism' scatterData={data.drift} />
              </GridItem>
              <GridItem>
                <Scatter title='Estimated Defocus' scatterData={data.drift} />
              </GridItem>
              <GridItem>
                <Scatter title='Estimated Resolution' scatterData={data.drift} />
              </GridItem>
            </Grid>
            <Heading size='md'>Motion Correction/CTF</Heading>
            <Divider />
            <Box>
              <Grid p={2} templateColumns='repeat(4, 1fr)' gap={2}>
                <GridItem>
                  <InfoGroup info={data.motion}></InfoGroup>
                </GridItem>
                <GridItem>
                  <Image src='http://INVALID.com/image' title='Micrograph Snapshot' height={`${size.width}px`} />
                </GridItem>
                <GridItem>
                  <Image src='http://INVALID.com/image' title='FFT Theoretical' height={`${size.width}px`} />
                </GridItem>
                <GridItem>
                  <Scatter
                    title='Drift'
                    scatterData={data.drift}
                    height={`${size.width}px`}
                    width={`${size.width}px`}
                  />
                </GridItem>
              </Grid>
            </Box>
            <Heading size='md'>Shift Plot</Heading>
            <Divider />
            <Box>TODO</Box>
            <Heading size='md'>Cross Section</Heading>
            <Divider />
            <Box>TODO</Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default Collection;
