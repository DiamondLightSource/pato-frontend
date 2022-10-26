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
  Progress,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Scatter from "../components/scatter";
import Image from "../components/image";
import { client } from "../utils/api/client";
import InfoGroup, { Info } from "../components/infogroup";
import { baseToast } from "../styles/components";

interface WindowDimensions {
  width: number;
  height: number;
}

interface ApiData {
  ctf: Info[];
  drift: { x: number; y: number }[];
}

const getData = async (collectionId: string) => {
  //const driftResponse = await client.get(`drift/${collectionId}`)
  const driftResponse = { data: [{ deltaX: 1, deltaY: 2 }] };
  const ctfResponse = await client.get(`ctf/${collectionId}`);
  return {
    drift: driftResponse.data.map((drift: Record<string, any>) => {
      return { x: drift.deltaX, y: drift.deltaY };
    }),
    ctf: ctfResponse.data,
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
  const [data, setData] = useState<ApiData>({ ctf: [], drift: [] });
  const size = useGridSize(6);
  const [isLoading, setLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    getData(params.collectionId || "")
      .then((apiData) => setData(apiData))
      .catch(() => {
        toast({
          ...baseToast,
          title: "Error!",
          description: "An error occurred and data could not be retrieved. Please try again.",
          status: "error",
        });
      })
      .finally(() => setLoading(false));
  }, [params.collectionId, toast]);

  return (
    <Box>
      {isLoading ? <Progress size='xs' isIndeterminate /> : <></>}
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
                  <InfoGroup info={data.ctf}></InfoGroup>
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
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default Collection;
