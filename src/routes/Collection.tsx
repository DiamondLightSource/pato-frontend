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
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Scatter from "../components/scatter";
import Image from "../components/image";
import { client } from "../utils/api/client";
import InfoGroup, { Info } from "../components/infogroup";
import { baseToast } from "../styles/components";
import { useAppDispatch } from "../store/hooks";
import { setLoading } from "../features/uiSlice";
import MotionPagination from "../components/motionPagination";

interface WindowDimensions {
  width: number;
  height: number;
}

interface ApiData {
  motion: Info[];
  drift: { x: number; y: number }[];
}

const driftPlotOptions = {
  maintainAspectRatio: false,
  plugins: { legend: { display: false } },
  scales: {
    x: {
      min: -20,
      max: 20,
      title: { display: true, text: "δx Å" },
    },
    y: {
      min: -20,
      max: 20,
      title: { display: true, text: "δy Å" },
    },
  },
  spanGaps: true,
  showLine: false,
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
  const [totalMotion, setTotalMotion] = useState(1);
  const size = useGridSize(6);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const navigate = useNavigate();

  const getData = useCallback(
    (endpoint: string) => {
      dispatch(setLoading(true));
      client
        .get(endpoint)
        .then((response) => {
          const summary = response.data.data[0];
          let motion: Info[] = [];

          if (response.data.data.length > 0) {
            for (let key in response.data.data[0]) {
              if (typeof summary[key] === "string" || typeof summary[key] === "number") {
                motion.push({ label: key, value: summary[key] });
              }
            }
          }

          const data = {
            drift: summary.drift.map((frame: Record<string, any>) => ({ x: frame.deltaX, y: frame.deltaY })),
            motion: motion,
          };

          setData(data);
          setTotalMotion(response.data.total);
        })
        .catch((response) => {
          if (response.detail === "Could not validate token") {
            toast({
              ...baseToast,
              title: "Your session is invalid, please log in to access this page.",
              status: "error",
            });
            navigate("/login", { state: { redirect: true } });
            return;
          }
          toast({
            ...baseToast,
            title: "An error occurred and data could not be retrieved. Please try again.",
            status: "error",
          });
        })
        .finally(() => dispatch(setLoading(false)));
    },
    [dispatch, navigate, toast]
  );

  useEffect(() => getData(`motion/${params.collectionId}`), [params.collectionId, getData]);

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
            <Heading variant='collection'>Summary</Heading>
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
            <Heading variant='collection'>Motion Correction/CTF</Heading>
            <Divider />
            <Box>
              <MotionPagination
                total={totalMotion}
                onChange={(page) => getData(`motion/${params.collectionId}?motionId=${page}`)}
              />
              <Grid p={2} templateColumns='repeat(4, 1fr)' gap={2}>
                <GridItem>
                  <InfoGroup height={size.height + 78} info={data.motion}></InfoGroup>
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
                    options={driftPlotOptions}
                    scatterData={data.drift}
                    height={`${size.width}px`}
                    width={`${size.width}px`}
                  />
                </GridItem>
              </Grid>
            </Box>
            <Heading variant='collection'>Shift Plot</Heading>
            <Divider />
            <Box>TODO</Box>
            <Heading variant='collection'>Cross Section</Heading>
            <Divider />
            <Box>TODO</Box>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default Collection;
