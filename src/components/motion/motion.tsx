import {
  Spacer,
  HStack,
  Divider,
  Grid,
  Button,
  Heading,
  Circle,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerHeader,
  DrawerBody,
  useDisclosure,
  Code,
  GridItem,
} from "@chakra-ui/react";
import { ImageCard } from "../visualisation/image";
import { InfoGroup } from "../visualisation/infogroup";
import { ScatterPlot } from "../visualisation/scatter";
import { MotionPagination } from "./pagination";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { MdComment } from "react-icons/md";
import { useDispatch } from "react-redux";
import { setLoading } from "../../features/uiSlice";
import { client } from "../../utils/api/client";
import { parseData } from "../../utils/generic";
import { driftPlotOptions } from "../../utils/config/plot";
import { ScatterDataPoint } from "chart.js";
import { buildEndpoint } from "../../utils/api/endpoint";
import { Info } from "../../utils/interfaces";

interface MotionData {
  /** Total number of tilt alignment images available */
  total: number;
  /** Total number of motion correction images available (including tilt alignment) */
  rawTotal: number;
  /** Motion correction comments */
  comments_MotionCorrection?: string;
  /** CTF comments */
  comments_CTF?: string;
  /** Refined tilt axis */
  refinedTiltAxis?: number;
  info: Info[];
}

interface MotionProps {
  /** ID for the parent of the motion correction. Could be a tomogram or something else in the future. */
  parentId: number;
  /** Whether parent is a tomogram or data collection */
  parentType: "tomograms" | "dataCollections" | "autoProc";
  /** Callback for when a new motion correction item is requested and received */
  onMotionChanged?: (motion: MotionData, page: number) => void;
  /** Callback for when the number of available items changes */
  onTotalChanged?: (newTotal: number) => void;
}

const motionConfig = {
  include: [
    { name: "refinedTiltAngle", unit: "°" },
    { name: "createdTimeStamp", label: "Movie Timestamp" },
    { name: "firstFrame" },
    { name: "lastFrame" },
    { name: "refinedMagnification" },
    { name: "dosePerFrame", unit: "e⁻/Å²" },
    { name: "doseWeight" },
    { name: "totalMotion", unit: "Å" },
    { name: "averageMotionPerFrame", label: "Average Motion/Frame", unit: "Å" },
    { name: "imageNumber" },
    { name: ["patchesUsedX", "patchesUsedY"], label: "Patches Used" },
    { name: ["boxSizeX", "boxSizeY"], label: "Box Size", unit: "μm" },
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
  root: [
    "tomogramId",
    "movieId",
    "drift",
    "total",
    "rawTotal",
    "refinedTiltAxis",
    "comments_CTF",
    "comments_MotionCorrection",
  ],
};

const calcDarkImages = (total: number, rawTotal: number) => {
  if (rawTotal === undefined) {
    return "No tilt alignment data available";
  }

  if (isNaN(rawTotal - total)) {
    return "?";
  }

  return `Dark Images: ${rawTotal - total}`;
};

const Motion = ({ parentId, onMotionChanged, onTotalChanged, parentType }: MotionProps) => {
  const [page, setPage] = useState<number | undefined>();
  const [motion, setMotion] = useState<MotionData>({ total: 0, rawTotal: 0, info: [] });
  const [drift, setDrift] = useState<ScatterDataPoint[]>([]);
  const [mgImage, setMgImage] = useState("");
  const [fftImage, setFftImage] = useState("");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const dispatch = useDispatch();

  const setImage = (endpoint: string, setState: Dispatch<SetStateAction<string>>) => {
    client.safe_get(endpoint).then((response) => {
      if (response.status === 200) {
        setState(URL.createObjectURL(response.data));
      }
    });
  };

  const flattenMovieData = (rawData: Record<string, any>) => {
    let flattenedData: Record<string, string> = { rawTotal: rawData.rawTotal, total: rawData.total };
    const items = rawData.items[0];

    for (let type in items) {
      if (items[type] !== null) {
        for (let [key, value] of Object.entries(items[type])) {
          if (key !== "comments") {
            flattenedData[key] = value as string;
          } else {
            flattenedData[`${key}_${type}`] = value as string;
          }
        }
      }
    }

    return flattenedData;
  };

  useEffect(() => {
    dispatch(setLoading(true));
    client
      .safe_get(buildEndpoint(`${parentType}/${parentId}/motion`, {}, 1, page ?? 0))
      .then((response) => {
        setMotion(parseData(flattenMovieData(response.data), motionConfig) as MotionData);

        if (onTotalChanged) {
          onTotalChanged(response.data.total);
        }

        if (page !== undefined || parentType !== "tomograms") {
          const movie = response.data.items[0].Movie;
          if (movie !== undefined) {
            setImage(`movies/${movie.movieId}/micrograph`, setMgImage);
            setImage(`movies/${movie.movieId}/fft`, setFftImage);
            const driftUrl = `movies/${movie.movieId}/drift?fromDb=${parentType === "autoProc"}`;

            client.safe_get(driftUrl).then((response) => {
              setDrift(response.data.items);
            });
          }

          if (onMotionChanged !== undefined) {
            onMotionChanged(response.data, page ?? -1);
          }
        }
      })
      .finally(() => dispatch(setLoading(false)));
  }, [page, parentId, parentType, dispatch, onMotionChanged, onTotalChanged]);

  return (
    <div>
      <HStack>
        <Heading variant='collection'>Motion Correction/CTF</Heading>
        {parentType !== "autoProc" && (
          <Heading size='sm' color='diamond.300'>
            {calcDarkImages(motion.total, motion.rawTotal)}
          </Heading>
        )}
        <Spacer />
        <Button
          data-testid='comment'
          disabled={!(motion.comments_CTF || motion.comments_MotionCorrection)}
          size='xs'
          onClick={onOpen}
        >
          <MdComment />
          {(motion.comments_CTF || motion.comments_MotionCorrection) && (
            <Circle size='3' position='absolute' top='-1' left='-1' bg='red'></Circle>
          )}
        </Button>
        <MotionPagination
          startFrom={parentType === "tomograms" ? "middle" : "end"}
          total={motion.total || motion.rawTotal}
          onChange={(page) => setPage(page)}
        />
      </HStack>
      <Divider />
      <Grid py={2} templateColumns='repeat(4, 1fr)' gap={2}>
        <GridItem h='25vh' colSpan={{ base: 2, md: 1 }}>
          <InfoGroup info={motion.info} />
        </GridItem>
        <GridItem h='25vh' colSpan={{ base: 2, md: 1 }}>
          <ImageCard src={mgImage} title='Micrograph Snapshot' height='100%' />
        </GridItem>
        <GridItem h='25vh' colSpan={{ base: 2, md: 1 }}>
          <ImageCard src={fftImage} title='FFT Theoretical' height='100%' />
        </GridItem>
        <GridItem h='25vh' minW='100%' colSpan={{ base: 2, md: 1 }}>
          <ScatterPlot title='Drift' options={driftPlotOptions} scatterData={drift} />
        </GridItem>
      </Grid>
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
    </div>
  );
};

export { Motion };
