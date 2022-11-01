import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Button,
  Divider,
  Grid,
  Heading,
  HStack,
  Spacer,
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
import { MdSettings } from "react-icons/md";

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

const Collection = () => {
  const params = useParams();
  const [data, setData] = useState<ApiData>({ motion: [], drift: [] });
  const [totalMotion, setTotalMotion] = useState(1);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const navigate = useNavigate();

  const getData = useCallback(
    (endpoint: string) => {
      dispatch(setLoading(true));
      client
        .get(endpoint)
        .then((response) => {
          const summary = response.data;
          let motion: Info[] = [];

          for (let key in summary) {
            if (typeof summary[key] === "string" || typeof summary[key] === "number") {
              motion.push({ label: key, value: summary[key] });
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

  useEffect(() => {
    document.title = `eBIC » Collections » ${params.collectionId}`;
    getData(`motion/${params.collectionId}`);
  }, [params.collectionId, getData]);

  return (
    <Box>
      <Heading>
        Data Collection {params.collectionId} for {params.propId}-{params.visitId}
      </Heading>
      <Divider />
      <Accordion defaultIndex={[0]} allowMultiple>
        <AccordionItem>
          <HStack py={1.5} px={3} bg='diamond.100'>
            <h2>Tomogram #1</h2>
            <Spacer />
            <Button>
              <MdSettings />
            </Button>
            <AccordionButton flex='0 1'>
              <AccordionIcon />
            </AccordionButton>
          </HStack>
          <AccordionPanel p={4}>
            <Heading variant='collection'>Alignment</Heading>
            <Divider />
            <Grid py={2} templateColumns='repeat(3, 1fr)' h='33vh' gap={2}>
              <InfoGroup info={data.motion} />
              <Image title='Central Slice' src='http://INVALID.com/image' height='100%' />
              <Scatter title='Shift Plot' scatterData={data.drift} height='100%' />
            </Grid>
            <HStack>
              <Heading variant='collection'>Motion Correction/CTF</Heading>
              <Spacer />
              <MotionPagination
                total={totalMotion}
                onChange={(page) => getData(`motion/${params.collectionId}?motionId=${page}`)}
              />
            </HStack>
            <Divider />
            <Grid py={2} templateColumns='repeat(4, 1fr)' h='25vh' gap={2}>
              <InfoGroup info={data.motion} />
              <Image src='http://INVALID.com/image' title='Micrograph Snapshot' height='100%' />
              <Image src='http://INVALID.com/image' title='FFT Theoretical' height='100%' />
              <Scatter title='Drift' options={driftPlotOptions} scatterData={data.drift} height='25vh' />
            </Grid>
          </AccordionPanel>
        </AccordionItem>
      </Accordion>
    </Box>
  );
};

export default Collection;
