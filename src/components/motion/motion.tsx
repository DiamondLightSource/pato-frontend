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
  Skeleton,
  Tooltip,
  Stack,
} from "@chakra-ui/react";
import { PlotContainer } from "components/visualisation/plotContainer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MdComment } from "react-icons/md";
import { client, prependApiUrl } from "utils/api/client";
import { parseData } from "utils/generic";
import { driftPlotOptions } from "utils/config/plot";
import { useQuery } from "@tanstack/react-query";
import {
  Flipper,
  ScatterPlot,
  InfoGroup,
  ImageCard,
  BasePoint,
  Info,
  FlipperProps,
} from "diamond-components";

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

export interface MotionProps {
  /** ID for the parent of the motion correction. Could be a tomogram or something else in the future. */
  parentId: number;
  /** Whether parent is a tomogram or data collection */
  parentType: "tomograms" | "dataCollections" | "autoProc";
  /** Callback for when page changes */
  onPageChanged?: (newPage: number) => void;
  /** Callback for when the number of available items changes */
  onTotalChanged?: (newTotal: number) => void;
  /** Current page */
  page?: number;
}

const motionConfig = {
  include: [
    { name: "createdTimeStamp", label: "Movie Timestamp" },
    { name: "firstFrame" },
    { name: "lastFrame" },
    { name: "refinedMagnification" },
    { name: "dosePerFrame", unit: "e⁻/Å²" },
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

interface FullMotionData {
  motion: MotionData | null;
  total: number | null;
  micrograph: string;
  fft: string;
  drift: BasePoint[];
}

const fetchMotionData = async (
  parentType: "tomograms" | "dataCollections" | "autoProc",
  parentId: number,
  page: number | undefined
) => {
  let fullEndpoint = `${parentType}/${parentId}/motion?limit=1`;

  if (parentType === "tomograms" && page === undefined) {
    fullEndpoint += "&getMiddle=true";
  } else {
    fullEndpoint += `&page=${page ? page - 1 : -1}`;
  }

  const response = await client.safeGet(fullEndpoint);
  let data: FullMotionData = { motion: null, total: null, micrograph: "", fft: "", drift: [] };

  if (response.status !== 200) {
    return data;
  }

  // Refined tilt angle is irrelevant to SPA
  const extendedMotionConfig =
    parentType === "tomograms"
      ? {
          ...motionConfig,
          include: [...motionConfig.include, { name: "refinedTiltAngle", unit: "°" }],
        }
      : motionConfig;

  data = {
    ...data,
    total: response.data.total,
    motion: parseData(flattenMovieData(response.data), extendedMotionConfig) as MotionData,
  };

  const movie = response.data.items[0].Movie;

  if (movie !== undefined) {
    data = {
      ...data,
      micrograph: prependApiUrl(`movies/${movie.movieId}/micrograph`),
      fft: prependApiUrl(`movies/${movie.movieId}/fft`),
    };

    const fileData = await client.safeGet(
      `movies/${movie.movieId}/drift?fromDb=${parentType === "autoProc"}`
    );

    if (fileData.status === 200) {
      data.drift = fileData.data.items;
    }
  }

  return data;
};

const Motion = ({ parentId, onPageChanged, onTotalChanged, parentType, page }: MotionProps) => {
  const [innerPage, setInnerPage] = useState<number | undefined>();
  const [actualTotal, setActualTotal] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data, isLoading } = useQuery({
    queryKey: ["motion", parentId, parentType, innerPage],
    queryFn: async () => await fetchMotionData(parentType, parentId, innerPage),
  });

  const darkImages = useMemo(() => {
    if (!data || !data.motion || !data.total || data.motion.rawTotal === undefined) {
      return "No tilt alignment data available";
    }

    if (isNaN(data.motion.rawTotal - data.total)) {
      return "?";
    }

    return `Dark Images: ${data.motion.rawTotal - data.total}`;
  }, [data]);
  const hasComments = useMemo(
    () =>
      data && data.motion && (data.motion.comments_CTF || data.motion.comments_MotionCorrection),
    [data]
  );

  useEffect(() => {
    if (page) {
      setInnerPage(page);
    }
  }, [page]);

  const handlePageChanged = useCallback(
    (newPage: number) => {
      if (onPageChanged) {
        onPageChanged(newPage);
      }

      if (page === undefined) {
        setInnerPage(newPage);
      }
    },
    [onPageChanged, page]
  );

  const flipperProps = useMemo(() => {
    let base: FlipperProps = {
      startFrom: parentType === "tomograms" ? "middle" : "end",
      total: actualTotal,
    };

    if (page) {
      return { ...base, page, onChange: handlePageChanged };
    }

    return { ...base, defaultPage: page, onChangeEnd: handlePageChanged };
  }, [actualTotal, handlePageChanged, page, parentType]);

  useEffect(() => {
    if (data && data.motion) {
      const total = data.total || data.motion.rawTotal;
      setActualTotal(total);
      if (onTotalChanged) {
        onTotalChanged(total);
      }
    }
  }, [onTotalChanged, data]);

  return (
    <div>
      <Stack direction={{ base: "column", md: "row" }}>
        <Heading variant='collection' pr='2' mt='0'>
          Motion Correction/CTF
        </Heading>
        {parentType !== "autoProc" && (
          <Heading size='sm' display='flex' alignSelf='center' color='diamond.300'>
            {darkImages}
          </Heading>
        )}
        <Spacer />
        <HStack>
          <Tooltip id='comment' label='View Comments'>
            <Button data-testid='comment' isDisabled={!hasComments} size='xs' onClick={onOpen}>
              <MdComment />
              {hasComments && (
                <Circle size='3' position='absolute' top='-1' left='-1' bg='red'></Circle>
              )}
            </Button>
          </Tooltip>
          <Flipper {...flipperProps} />
        </HStack>
      </Stack>
      <Divider />
      {data && data.motion ? (
        <Grid py={2} templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={2}>
          <GridItem h={{ base: "15vh", md: "25vh" }} colSpan={{ base: 2, md: 1 }}>
            <InfoGroup info={data.motion.info} />
          </GridItem>
          <GridItem h={{ base: "20vh", md: "25vh" }}>
            <ImageCard src={data.micrograph} title='Micrograph Snapshot' height='100%' />
          </GridItem>
          <GridItem h={{ base: "20vh", md: "25vh" }}>
            <ImageCard src={data.fft} title='FFT Theoretical' height='100%' />
          </GridItem>
          <GridItem h={{ base: "20vh", md: "25vh" }} colSpan={{ base: 2, md: 1 }}>
            <PlotContainer title='Drift'>
              <ScatterPlot options={driftPlotOptions} data={data.drift} />
            </PlotContainer>
          </GridItem>
          <Drawer isOpen={isOpen} placement='right' onClose={onClose}>
            <DrawerOverlay />
            <DrawerContent>
              <DrawerCloseButton />
              <DrawerHeader>Comments</DrawerHeader>
              <DrawerBody>
                <Heading size='sm'>CTF</Heading>
                <Code h='25vh' w='100%' overflowY='scroll'>
                  {data.motion.comments_CTF}
                </Code>
                <Divider marginY={3} />
                <Heading size='sm'>Motion Correction</Heading>
                <Code h='25vh' w='100%' overflowY='scroll'>
                  {data.motion.comments_MotionCorrection}
                </Code>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Grid>
      ) : isLoading ? (
        <Skeleton h='25vh' />
      ) : (
        <Heading pt='10vh' variant='notFound' h='25vh'>
          No Motion Correction Data Available
        </Heading>
      )}
    </div>
  );
};

export { Motion };
