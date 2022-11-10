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
} from "@chakra-ui/react";
import Image from "./image";
import InfoGroup from "./infogroup";
import Scatter from "./scatter";
import MotionPagination from "./motionPagination";
import { FunctionComponent, useEffect, useState } from "react";
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
  const [mgImage, setMgImage] = useState("");
  const [fftImage, setFftImage] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (motion.movieId !== undefined) {
      client.safe_get(`thumbnail/micrograph/${motion.movieId}`).then((response) => {
        setMgImage(URL.createObjectURL(response.data));
      });

      client.safe_get(`thumbnail/fft/${motion.movieId}`).then((response) => {
        setFftImage(URL.createObjectURL(response.data));
      });
    }
    dispatch(setLoading(false));
  }, [motion, dispatch]);

  useEffect(() => {
    dispatch(setLoading(true));
    client.safe_get(`motion/${tomogram.tomogramId}${page === -1 ? " " : `?nth=${page}`}`).then((response) => {
      setMotion(parseData(response.data, ["tomogramId", "movieId", "total", "rawTotal"]));
    });
  }, [page, tomogram, dispatch, navigate]);

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
          <Image src={mgImage} title='Micrograph Snapshot' height='100%' />
          <Image src={fftImage} title='FFT Theoretical' height='100%' />
          <Scatter title='Drift' options={driftPlotOptions} scatterData={motion.drift} height='25vh' />
        </Grid>
      </AccordionPanel>
    </AccordionItem>
  );
};

export default Tomogram;
