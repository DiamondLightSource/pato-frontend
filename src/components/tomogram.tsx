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
  Skeleton,
  Circle,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Code,
} from "@chakra-ui/react";
import Image from "./image";
import InfoGroup from "./infogroup";
import Scatter from "./scatter";
import MotionPagination from "./motionPagination";
import React, { Dispatch, FunctionComponent, SetStateAction, useEffect, useState } from "react";
import { MdComment, MdSettings } from "react-icons/md";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setLoading } from "../features/uiSlice";
import { client } from "../utils/api/client";
import { parseData } from "../utils/generic";
import { ScatterDataPoint } from "chart.js";

interface TomogramProp {
  tomogram: Record<string, any>;
}

interface CtfData {
  resolution: ScatterDataPoint[];
  astigmatism: ScatterDataPoint[];
  defocus: ScatterDataPoint[];
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

const astigmatismPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { title: { display: true, text: "nm" } } },
};

const defocusPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { title: { display: true, text: "μm" } } },
};

const resolutionPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { title: { display: true, text: "Å" } } },
};

const motionConfig = {
  include: [
    { name: "imageNumber" },
    { name: "createdTimeStamp", label: "movieTimeStamp" },
    { name: "firstFrame" },
    { name: "lastFrame" },
    { name: "refinedTiltAxis" },
    { name: "refinedMagnification" },
    { name: "refinedTiltAngle" },
    { name: "dosePerFrame", unit: "e⁻/Å²" },
    { name: "doseWeight" },
    { name: "totalMotion", unit: "Å" },
    { name: "averageMotionPerFrame", label: "Average Motion/Frame", unit: "Å" },
    { name: ["patchesUsedX", "patchesUsedY"], label: "patchesUsed" },
    { name: ["boxSizeX", "boxSizeY"], label: "boxSize", unit: "μm" },
    { name: ["minResolution", "maxResolution"], label: "Resolution", unit: "Å" },
    { name: ["minDefocus", "maxDefocus"], label: "Defocus", unit: "Å" },
    { name: "amplitudeContrast" },
    { name: "defocusStepSize", unit: "Å" },
    { name: "astigmatism", unit: "nm" },
    { name: "astigmatismAngle", unit: "°" },
    { name: "estimatedResolution", unit: "Å" },
    { name: "estimatedDefocus", unit: "μm" },
    { name: "ccValue", label: "CC Value" },
  ],
  root: ["tomogramId", "movieId", "total", "rawTotal", "comments_MotionCorrection", "comments_CTF"],
};

const calcDarkImages = (total: number, rawTotal: number) => {
  if (isNaN(rawTotal - total)) {
    return "?";
  }

  if (total === 0 && rawTotal > 0) {
    return "No tilt alignment data available";
  }

  return `Dark Images: ${rawTotal - total}`;
};

const Tomogram: FunctionComponent<TomogramProp> = ({ tomogram }): JSX.Element => {
  const [page, setPage] = useState(-1);
  const [motion, setMotion] = useState<Record<string, any>>({ drift: [], total: 0, info: [] });
  const [mgImage, setMgImage] = useState("");
  const [fftImage, setFftImage] = useState("");
  const [sliceImage, setSliceImage] = useState("");
  const [shiftData, setShiftData] = useState<ScatterDataPoint[]>([]);
  const [ctfData, setCtfData] = useState<CtfData>();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const setImage = (endpoint: string, setState: Dispatch<SetStateAction<string>>) => {
    client.safe_get(endpoint).then((response) => {
      if (response.status === 200) {
        setState(URL.createObjectURL(response.data));
      }
    });
  };

  useEffect(() => {
    if (motion.movieId !== undefined) {
      setImage(`image/micrograph/${motion.movieId}`, setMgImage);
      setImage(`image/fft/${motion.movieId}`, setFftImage);
    }
    dispatch(setLoading(false));
  }, [motion, dispatch]);

  useEffect(() => {
    dispatch(setLoading(true));
    client.safe_get(`motion/${tomogram.tomogramId}${page === -1 ? " " : `?nth=${page}`}`).then((response) => {
      setMotion(parseData(response.data, motionConfig));
    });
  }, [page, tomogram, dispatch, navigate]);

  useEffect(() => {
    setImage(`image/slice/${tomogram.tomogramId}`, setSliceImage);

    const ctfData: CtfData = { resolution: [], astigmatism: [], defocus: [] };
    client.safe_get(`ctf/${tomogram.tomogramId}`).then((response) => {
      if (Array.isArray(response.data.items)) {
        for (const ctf of response.data.items) {
          ctfData.resolution.push({ x: ctf.refinedTiltAngle, y: ctf.estimatedResolution });
          ctfData.astigmatism.push({ x: ctf.refinedTiltAngle, y: ctf.astigmatism });
          ctfData.defocus.push({ x: ctf.refinedTiltAngle, y: ctf.estimatedDefocus });
        }
        setCtfData(ctfData);
      }
    });

    client.safe_get(`shiftPlot/${tomogram.tomogramId}`).then((response) => {
      if (response.status === 200) {
        setShiftData(response.data.items);
      }
    });
  }, [tomogram]);

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
        <Heading variant='collection'>Summary</Heading>
        <Divider />
        {ctfData === undefined ? (
          <Skeleton h='20vh' />
        ) : (
          <Grid py={2} marginBottom={6} templateColumns='repeat(3, 1fr)' h='20vh' gap={2}>
            <Scatter
              height='20vh'
              title='Astigmatism'
              scatterData={ctfData.astigmatism}
              options={astigmatismPlotOptions}
            />
            <Scatter height='20vh' title='Defocus' scatterData={ctfData.defocus} options={defocusPlotOptions} />
            <Scatter
              height='20vh'
              title='Resolution'
              scatterData={ctfData.resolution}
              options={resolutionPlotOptions}
            />
          </Grid>
        )}
        <Heading variant='collection'>Alignment</Heading>
        <Divider />
        <Grid py={2} templateColumns='repeat(3, 1fr)' h='33vh' gap={2}>
          <InfoGroup info={tomogram.info} />
          <Image title='Central Slice' src={sliceImage} height='100%' />
          <Scatter title='Shift Plot' scatterData={shiftData} height='32vh' />
        </Grid>
        <HStack marginTop={2}>
          <Heading variant='collection'>Motion Correction/CTF</Heading>
          <Heading size='sm' color='diamond.200'>
            {calcDarkImages(motion.total, motion.rawTotal)}
          </Heading>
          <Spacer />
          <Button
            name='comment'
            disabled={!(motion.comments_CTF || motion.comments_MotionCorrection)}
            size='xs'
            onClick={onOpen}
          >
            <MdComment />
            {(motion.comments_CTF || motion.comments_MotionCorrection) && (
              <Circle size='3' position='absolute' top='-1' left='-1' bg='red'></Circle>
            )}
          </Button>
          <MotionPagination total={motion.total || motion.rawTotal} onChange={(page) => setPage(page)} />
        </HStack>
        <Divider />
        <Grid py={2} templateColumns='repeat(4, 1fr)' h='25vh' gap={2}>
          <InfoGroup info={motion.info} />
          <Image src={mgImage} title='Micrograph Snapshot' height='100%' />
          <Image src={fftImage} title='FFT Theoretical' height='100%' />
          <Scatter title='Drift' options={driftPlotOptions} scatterData={motion.drift} height='25vh' />
        </Grid>
      </AccordionPanel>
      <Drawer isOpen={isOpen} placement='right' onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Comments</DrawerHeader>
          <DrawerBody>
            <Heading size='sm'>CTF</Heading>
            <Code>{motion.comments_CTF}</Code>
            <Divider marginY={3} />
            <Heading size='sm'>Motion Correction</Heading>
            <Code>{motion.comments_MotionCorrection}</Code>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </AccordionItem>
  );
};

export default Tomogram;
