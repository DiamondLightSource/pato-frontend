import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Spacer,
  HStack,
  Divider,
  Grid,
  Button,
  Heading,
  Text,
} from "@chakra-ui/react";
import Image from "./image";
import InfoGroup from "./infogroup";
import Scatter from "./scatter";
import MotionPagination from "./motionPagination";
import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { MdSettings } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLoading } from "../features/uiSlice";
import { client } from "../utils/api/client";
import { parseData } from "../utils/generic";

interface TomogramProp {
  tomogram: Record<string, any>;
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

const Tomogram: FunctionComponent<TomogramProp> = ({ tomogram }): JSX.Element => {
  const [page, setPage] = useState(-1);
  const [motion, setMotion] = useState<Record<string, any>>({ drift: [], total: 0, info: [] });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = useCallback(
    async (endpoint: string): Promise<Record<string, any>> => {
      let data = {};
      dispatch(setLoading(true));
      try {
        const response = await client.get(endpoint);
        data = response.data;
      } catch (response: any) {
        if (response.redirect) {
          navigate(response.redirect, { state: { redirect: true } });
        }
      }

      dispatch(setLoading(false));
      return data;
    },
    [dispatch, navigate]
  );

  useEffect(() => {
    getData(`motion/${tomogram.tomogramId}${page === -1 ? " " : `?nth=${page}`}`).then((response) => {
      setMotion(parseData(response, ["tomogramId", "movieId", "total", "rawTotal"]));
    });
  }, [page, tomogram, getData]);

  return (
    <AccordionItem>
      <HStack py={1.5} px={3} bg='diamond.100'>
        <h2>Tomogram {tomogram.tomogramId}</h2>
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
          <InfoGroup info={tomogram.info} />
          <Image title='Central Slice' src='http://INVALID.com/image' height='100%' />
          <Scatter title='Shift Plot' scatterData={[]} height='32vh' />
        </Grid>
        <HStack marginTop={2}>
          <Heading variant='collection'>Motion Correction/CTF</Heading>
          <Heading size='sm' color='diamond.200'>
            (Dark images: {isNaN(motion.rawTotal - motion.total) ? "?" : motion.rawTotal - motion.total})
          </Heading>
          <Spacer />
          <MotionPagination total={motion.total ?? 0} onChange={(page) => setPage(page)} />
        </HStack>
        <Divider />
        <Grid py={2} templateColumns='repeat(4, 1fr)' h='25vh' gap={2}>
          <InfoGroup info={motion.info} />
          <Image src='http://INVALID.com/image' title='Micrograph Snapshot' height='100%' />
          <Image src='http://INVALID.com/image' title='FFT Theoretical' height='100%' />
          <Scatter title='Drift' options={driftPlotOptions} scatterData={motion.drift} height='25vh' />
        </Grid>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default Tomogram;
