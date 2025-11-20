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
  Link as ChakraLink,
} from "@chakra-ui/react";
import { PlotContainer } from "components/visualisation/plotContainer";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MdComment, MdOutlineGrain } from "react-icons/md";
import { driftPlotOptions } from "utils/config/plot";
import { useQuery } from "@tanstack/react-query";
import {
  Flipper,
  ScatterPlot,
  InfoGroup,
  ImageCard,
  FlipperProps,
} from "@diamondlightsource/ui-components";
import { countDarkImages, fetchMotionData } from "utils/api/queries/motion";
import { fetchMovieData } from "utils/api/queries/movie";
import { DarkImageCount } from "components/visualisation/DarkImages";

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

const Motion = ({ parentId, onPageChanged, onTotalChanged, parentType, page }: MotionProps) => {
  const [innerPage, setInnerPage] = useState<number | undefined>();
  const [actualTotal, setActualTotal] = useState(0);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { data: motion, isLoading: isMotionLoading } = useQuery({
    queryKey: ["motion", { parentId, parentType, innerPage }],
    queryFn: fetchMotionData,
    keepPreviousData: true,
  });

  const { data: movie, isLoading: isMovieLoading } = useQuery({
    // Movie ID is already guaranteed to be a valid number because of the 'enabled' check
    queryKey: ["movie", { movieId: motion?.movieId! }],
    queryFn: fetchMovieData,
    enabled: !!motion && !!motion.movieId,
  });

  const darkImages = useMemo(() => {
    if (motion) {
      return countDarkImages(motion);
    }
    return null;
  }, [motion]);

  const hasComments = useMemo(
    () =>
      motion && motion.data && (motion.data.comments_CTF || motion.data.comments_MotionCorrection),
    [motion]
  );

  const hasIds = useMemo(() => movie?.ids?.gridSquareId && movie?.ids?.foilHoleId, [movie]);

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

    return { ...base, defaultPage: motion?.page || page, onChangeEnd: handlePageChanged };
  }, [actualTotal, handlePageChanged, page, parentType, motion]);

  useEffect(() => {
    if (motion && motion.data) {
      const total = motion.total ?? 0;
      setActualTotal(total);
      if (onTotalChanged) {
        onTotalChanged(total);
      }
    }
  }, [onTotalChanged, motion]);

  return (
    <div>
      <Stack direction={{ base: "column", md: "row" }}>
        <Heading variant='collection' pr='2' mt='0'>
          Motion Correction/CTF
        </Heading>
        {parentType !== "autoProc" && <DarkImageCount count={darkImages} />}
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
          <Tooltip id='atlas' label='Return to Atlas'>
            <Button
              leftIcon={<MdOutlineGrain />}
              data-testid='movieToAtlas'
              as={ChakraLink}
              size='xs'
              {...(hasIds
                ? {
                    href: `atlas?gridSquare=${movie?.ids?.gridSquareId}&foilHole=${movie?.ids?.foilHoleId}`,
                  }
                : {
                    href: undefined,
                    isDisabled: true,
                  })}
            >
              View in Atlas
            </Button>
          </Tooltip>
          <Flipper {...flipperProps} w='5em' />
        </HStack>
      </Stack>
      <Divider />
      {!isMotionLoading && !isMovieLoading && movie && motion && motion.data ? (
        <Grid py={2} templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }} gap={2}>
          <GridItem h={{ base: "15vh", md: "25vh" }} colSpan={{ base: 2, md: 1 }}>
            <InfoGroup info={motion.data.info} />
          </GridItem>
          <GridItem h={{ base: "20vh", md: "25vh" }}>
            <ImageCard src={movie.micrograph} title='Micrograph Snapshot' height='100%' />
          </GridItem>
          <GridItem h={{ base: "20vh", md: "25vh" }}>
            <ImageCard src={movie.fft} title='FFT Theoretical' height='100%' />
          </GridItem>
          <GridItem h={{ base: "20vh", md: "25vh" }} colSpan={{ base: 2, md: 1 }}>
            <PlotContainer title='Drift'>
              <ScatterPlot options={driftPlotOptions} data={movie.drift} />
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
                  {motion.data.comments_CTF}
                </Code>
                <Divider marginY={3} />
                <Heading size='sm'>Motion Correction</Heading>
                <Code h='25vh' w='100%' overflowY='scroll'>
                  {motion.data.comments_MotionCorrection}
                </Code>
              </DrawerBody>
            </DrawerContent>
          </Drawer>
        </Grid>
      ) : motion !== null && (isMotionLoading || isMovieLoading) ? (
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
