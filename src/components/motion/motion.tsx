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
import { ImageCard } from "components/visualisation/image";
import { InfoGroup } from "components/visualisation/infogroup";
import { PlotContainer } from "components/visualisation/plotContainer";
import { MotionPagination } from "components/motion/pagination";
import { useCallback, useEffect, useState } from "react";
import { MdComment } from "react-icons/md";
import { client } from "utils/api/client";
import { parseData } from "utils/generic";
import { driftPlotOptions } from "utils/config/plot";
import { buildEndpoint } from "utils/api/endpoint";
import { BasePoint, Info } from "schema/interfaces";
import { Scatter } from "components/plots/scatter";
import { setImage } from "utils/api/response";

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
  /** Callback for when page changes */
  onPageChanged?: (page: number) => void;
  /** Callback for when the number of available items changes */
  onTotalChanged?: (newTotal: number) => void;
  /** Current page */
  currentPage?: number;
}

const motionConfig = {
  include: [
    { name: "refinedTiltAngle", unit: "°" },
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

const calcDarkImages = (total: number, rawTotal: number) => {
  if (rawTotal === undefined) {
    return "No tilt alignment data available";
  }

  if (isNaN(rawTotal - total)) {
    return "?";
  }

  return `Dark Images: ${rawTotal - total}`;
};

const Motion = ({ parentId, onPageChanged, onTotalChanged, parentType, currentPage }: MotionProps) => {
  const [page, setPage] = useState<number | undefined>();
  const [motion, setMotion] = useState<MotionData | null>();
  const [drift, setDrift] = useState<BasePoint[]>([]);
  const [mgImage, setMgImage] = useState<string>();
  const [fftImage, setFftImage] = useState<string>();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
    if (currentPage) {
      setPage(currentPage);
    }
  }, [currentPage]);

  const handlePageChanged = useCallback((page: number) => {
    if (onPageChanged) {
      onPageChanged(page)
    } 

    if (currentPage === undefined) {
      setPage(page)
    }
  }, [onPageChanged, currentPage])

  useEffect(() => {
    client.safeGet(buildEndpoint(`${parentType}/${parentId}/motion`, {}, 1, page ?? 0)).then((response) => {
      if (response.status === 200) {
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

            client.safeGet(driftUrl).then((response) => {
              if (response.data.items) {
                setDrift(response.data.items);
              }
            });
          }
        }
      } else {
        setMotion(null);
      }
    });
  }, [page, parentId, parentType, onTotalChanged]);

  return (
    <div>
      <Stack direction={{ base: "column", md: "row" }}>
        <Heading variant='collection' mt='0'>
          Motion Correction/CTF
        </Heading>

        {motion && (
          <>
            {parentType !== "autoProc" && (
              <Heading size='sm' color='diamond.300'>
                {calcDarkImages(motion.total, motion.rawTotal)}
              </Heading>
            )}
            <Spacer />
            <HStack>
              <Tooltip id='comment' label='View Comments'>
                <Button
                  data-testid='comment'
                  isDisabled={!(motion.comments_CTF || motion.comments_MotionCorrection)}
                  size='xs'
                  onClick={onOpen}
                >
                  <MdComment />
                  {(motion.comments_CTF || motion.comments_MotionCorrection) && (
                    <Circle size='3' position='absolute' top='-1' left='-1' bg='red'></Circle>
                  )}
                </Button>
              </Tooltip>
              <MotionPagination
                startFrom={parentType === "tomograms" ? "middle" : "end"}
                total={motion.total || motion.rawTotal}
                onChange={handlePageChanged}
                defaultPage={page}
              />
            </HStack>
          </>
        )}
      </Stack>
      <Divider />
      {motion ? (
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
          <GridItem h='25vh' colSpan={{ base: 2, md: 1 }}>
            <PlotContainer title='Drift'>
              <Scatter options={driftPlotOptions} data={drift} />
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
                  {motion.comments_CTF}
                </Code>
                <Divider marginY={3} />
                <Heading size='sm'>Motion Correction</Heading>
                <Code h='25vh' w='100%' overflowY='scroll'>
                  {motion.comments_MotionCorrection}
                </Code>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Grid>
      ) : (
        <>
          {motion === undefined ? (
            <Skeleton h='25vh' />
          ) : (
            <Heading pt='10vh' variant='notFound' h='25vh'>
              No Motion Correction Data Available
            </Heading>
          )}
        </>
      )}
    </div>
  );
};

export { Motion };
