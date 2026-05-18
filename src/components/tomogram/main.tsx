import {
  Divider,
  Grid,
  Button,
  Heading,
  GridItem,
  AccordionItem,
  AccordionPanel,
  Skeleton,
  VStack,
  Spacer,
  Icon,
  Box,
  HStack,
  Card,
  CardHeader,
  CardBody,
  Text,
  Select,
  Tooltip,
  useMediaQuery,
} from "@chakra-ui/react";
import { PlotContainer } from "components/visualisation/plotContainer";
import { Motion } from "components/motion/motion";
import { useCallback, useMemo, useState } from "react";
import { client, prependApiUrl } from "utils/api/client";
import {
  TomogramData,
  BaseProcessingJobProps,
  DataConfig,
  TomogramMovieTypes,
} from "schema/interfaces";
import { CTF } from "components/ctf/ctf";
import { components } from "schema/main";
import { ProcessingTitle } from "components/visualisation/processingTitle";
import { capitalise, parseData } from "utils/generic";
import { MdOpenInNew } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { tomographyRecipeTagMap } from "utils/config/parse";
import { ScatterPlot, InfoGroup, ImageCard, BasePoint } from "@diamondlightsource/ui-components";
import { countDarkImages, fetchMotionData } from "utils/api/queries/motion";
import { DarkImageCount } from "components/visualisation/DarkImages";

const recipes = Object.keys(tomographyRecipeTagMap);

/**
 * Check if recipe matches a given recipe type
 * @param target Target recipe type
 * @param procJob Processing job to check
 * @returns boolean
 */
const checkRecipe = (target: string, procJob: BaseProcessingJobProps["procJob"]) =>
  target === procJob.recipe;

const tomogramConfig: DataConfig = {
  include: [
    { name: "stackFile" },
    { name: "tiltAngleOffset", unit: "°" },
    { name: "zShift" },
    { name: "volumeFile" },
    { name: "pixelSpacing" },
    { name: "refinedTiltAxis", unit: "°" },
    { name: "globalAlignmentQuality" },
  ],
  root: ["dataCollectionId", "tomogramId"],
};

const sxtConfig: DataConfig = {
  include: [
    { name: "stackFile" },
    { name: "volumeFile" },
    { name: "globalAlignmentQuality" },
    { name: "sizeZ", unit: "pixels" },
  ],
  root: ["dataCollectionId", "tomogramId"],
};

interface FullTomogramData {
  tomogram: TomogramData | null;
  sxt: TomogramData | null;
  centralSlice: string;
  xyProj: string;
  xzProj: string;
  shiftPlot: BasePoint[];
}

type TomogramResponse = components["schemas"]["TomogramResponse"];

export interface TomogramProps extends BaseProcessingJobProps {
  tomogram: TomogramResponse | null;
  onTomogramOpened: (tomogramId: number, type: TomogramMovieTypes) => void;
}

const TomogramThumbnail = ({
  movieType,
  baseUrl,
}: {
  movieType: TomogramMovieTypes | null;
  baseUrl: string;
}) => (
  <VStack w='50%' h='100%' key={movieType}>
    <ImageCard
      p={0}
      borderColor='transparent'
      src={`${baseUrl}${movieType ? `?movieType=${movieType}` : ""}`}
    />
    <Text fontSize={13}>{movieType ? capitalise(movieType) : "Not Denoised"}</Text>
  </VStack>
);

const TomogramSlices = ({
  centralSlice,
  handleOpenTomogram,
}: {
  centralSlice: string;
  handleOpenTomogram: (type: TomogramMovieTypes) => void;
}) => (
  <Card h='100%'>
    <CardHeader>
      <HStack>
        <Heading size='sm'>Central Slice</Heading>
        <Spacer />
        <Button h='25px' size='sm' onClick={() => handleOpenTomogram("segmented")}>
          View Segmented
          <Spacer />
          <Icon ml='10px' as={MdOpenInNew}></Icon>
        </Button>
        <Button h='25px' size='sm' onClick={() => handleOpenTomogram("denoised")}>
          View Denoised
          <Spacer />
          <Icon ml='10px' as={MdOpenInNew}></Icon>
        </Button>
      </HStack>
    </CardHeader>
    <CardBody pt={0}>
      <HStack mx='auto' w='auto' h='100%' divider={<Divider orientation='vertical' />}>
        <TomogramThumbnail key='segmented' baseUrl={centralSlice} movieType='segmented' />,
        <TomogramThumbnail key='denoised' baseUrl={centralSlice} movieType='denoised' />
        <TomogramThumbnail key='noisy' baseUrl={centralSlice} movieType={null} />
      </HStack>
    </CardBody>
  </Card>
);

const TomogramSlicesHasPicks = ({
  centralSlice,
  handleOpenTomogram,
}: {
  centralSlice: string;
  handleOpenTomogram: (type: TomogramMovieTypes) => void;
}) => {
  const [selectedTomogram, setSelectedTomogram] = useState<TomogramMovieTypes>("segmented");
  const [isLargeScreen] = useMediaQuery("(min-width: 1500px)");
  const handleTomogramSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TomogramMovieTypes;
    setSelectedTomogram(value);
  };
  return (
    <Card h='100%'>
      <CardHeader>
        <HStack>
          <Heading size='sm'>Central Slice</Heading>
          <Spacer />
          {isLargeScreen ? (
            <>
              <Button h='25px' size='sm' onClick={() => handleOpenTomogram("picked")}>
                View Picked
                <Spacer />
                <Icon ml='10px' as={MdOpenInNew}></Icon>
              </Button>
              <Button h='25px' size='sm' onClick={() => handleOpenTomogram("segmented")}>
                View Segmented
                <Spacer />
                <Icon ml='10px' as={MdOpenInNew}></Icon>
              </Button>
            </>
          ) : (
            <>
              <Tooltip label='Select tomogram to display' placement='top'>
                <Select
                  h='25px'
                  w='175px'
                  size='sm'
                  defaultValue='segmented'
                  onChange={handleTomogramSelect}
                  rounded='md'
                  cursor='pointer'
                >
                  <option value='segmented'>Segmented</option>
                  <option value='segmented'>Picked</option>
                </Select>
              </Tooltip>
              <Button h='25px' size='sm' onClick={() => handleOpenTomogram(selectedTomogram)}>
                View {capitalise(selectedTomogram)}
                <Spacer />
                <Icon ml='10px' as={MdOpenInNew}></Icon>
              </Button>
            </>
          )}

          <Button h='25px' size='sm' onClick={() => handleOpenTomogram("denoised")}>
            View Denoised
            <Spacer />
            <Icon ml='10px' as={MdOpenInNew}></Icon>
          </Button>
        </HStack>
      </CardHeader>
      <CardBody pt={0}>
        <HStack mx='auto' w='auto' h='100%' divider={<Divider orientation='vertical' />}>
          {isLargeScreen ? (
            [
              <TomogramThumbnail key='picked' baseUrl={centralSlice} movieType='picked' />,
              <TomogramThumbnail key='segmented' baseUrl={centralSlice} movieType='segmented' />,
            ]
          ) : (
            <TomogramThumbnail
              key={selectedTomogram}
              baseUrl={centralSlice}
              movieType={selectedTomogram}
            />
          )}
          <TomogramThumbnail key='denoised' baseUrl={centralSlice} movieType='denoised' />
          <TomogramThumbnail key='noisy' baseUrl={centralSlice} movieType={null} />
        </HStack>
      </CardBody>
    </Card>
  );
};

const fetchTomogramData = async (tomogram: TomogramResponse | null) => {
  let data: FullTomogramData = {
    tomogram: null,
    sxt: null,
    centralSlice: "",
    xyProj: "",
    xzProj: "",
    shiftPlot: [],
  };

  if (tomogram) {
    const fileData = await client.safeGet(`tomograms/${tomogram.tomogramId}/shiftPlot`);

    data = {
      ...data,
      tomogram: parseData(tomogram, tomogramConfig) as TomogramData,
      sxt: parseData(tomogram, sxtConfig) as TomogramData,
      centralSlice: prependApiUrl(`tomograms/${tomogram.tomogramId}/centralSlice`),
      xyProj: prependApiUrl(`tomograms/${tomogram.tomogramId}/projection?axis=xy`),
      xzProj: prependApiUrl(`tomograms/${tomogram.tomogramId}/projection?axis=xz`),
    };

    if (fileData.status === 200 && fileData.data.items) {
      data.shiftPlot = fileData.data.items;
    }
  }

  return data;
};

const Tomogram = ({
  autoProc,
  procJob,
  tomogram,
  status,
  onTomogramOpened,
  active = false,
}: TomogramProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["tomogramAutoProc", procJob.processingJobId],
    queryFn: async () => await fetchTomogramData(tomogram),
  });

  const { data: motion, isLoading: isMotionLoading } = useQuery({
    queryKey: [
      "motion",
      { parentId: procJob.dataCollectionId, parentType: "tomograms", innerPage: undefined },
    ],
    queryFn: fetchMotionData,
  });

  const darkImages = useMemo(() => {
    if (motion) {
      return countDarkImages(motion);
    }
    return null;
  }, [motion]);

  const handleOpenTomogram = useCallback(
    (type: TomogramMovieTypes) => {
      onTomogramOpened(data!.tomogram!.tomogramId, type);
    },
    [data, onTomogramOpened]
  );

  return (
    <AccordionItem isDisabled={false}>
      <ProcessingTitle autoProc={autoProc} procJob={procJob} status={status} />
      {active && (
        <AccordionPanel bg='diamond.75' p={4}>
          {isLoading ? (
            <VStack h='82vh' w='100%' spacing={2}>
              <Skeleton w='100%' h='22vh' />
              <Skeleton w='100%' h='20vh' />
              <Skeleton w='100%' h='20vh' />
              <Skeleton w='100%' h='20vh' />
            </VStack>
          ) : !data || data.tomogram === null || data.sxt == null ? (
            <Box>
              <Motion parentId={procJob.dataCollectionId} parentType='tomograms' />
            </Box>
          ) : (
            <Grid gap={3} templateColumns={{ base: "", "2xl": "repeat(2, 1fr)" }}>
              <Box minW='0'>
                <HStack>
                  <Heading variant='collection'>Alignment</Heading>
                  {checkRecipe(recipes[0], procJob) && !isMotionLoading && (
                    <DarkImageCount count={darkImages} />
                  )}
                </HStack>
                <Divider />
                <Grid py={2} templateColumns='repeat(4, 1fr)' gap={2}>
                  <GridItem colSpan={{ base: 4, md: 2 }}>
                    {checkRecipe(recipes[0], procJob) ? (
                      <InfoGroup info={data.tomogram.info} cols={1} />
                    ) : (
                      <InfoGroup info={data.sxt.info} cols={1} />
                    )}
                  </GridItem>
                  <GridItem colSpan={{ base: 4, md: 2 }} h='20vh' minH='300px'>
                    <Card h='100%'>
                      <CardHeader>
                        <HStack>
                          <Heading size='sm'>Stacks</Heading>
                          <Spacer />
                          <Button
                            h='25px'
                            size='sm'
                            onClick={() => handleOpenTomogram("alignment")}
                          >
                            View
                            <Spacer />
                            <Icon ml='10px' as={MdOpenInNew}></Icon>
                          </Button>
                        </HStack>
                      </CardHeader>
                      <CardBody pt={0}>
                        <HStack
                          mx='auto'
                          w='auto'
                          h='100%'
                          divider={<Divider orientation='vertical' />}
                        >
                          <TomogramThumbnail
                            key='Alignment'
                            baseUrl={data.centralSlice}
                            movieType='alignment'
                          />
                          <TomogramThumbnail
                            key='Unaligned'
                            baseUrl={data.centralSlice}
                            movieType='stack'
                          />
                        </HStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem colSpan={4} h='20vh' minH='300px'>
                    {checkRecipe(recipes[0], procJob) ? (
                      <TomogramSlicesHasPicks
                        centralSlice={data.centralSlice}
                        handleOpenTomogram={handleOpenTomogram}
                      />
                    ) : (
                      <TomogramSlices
                        centralSlice={data.centralSlice}
                        handleOpenTomogram={handleOpenTomogram}
                      />
                    )}
                  </GridItem>
                  <GridItem colSpan={{ base: 4, md: 1 }} h='22vh' minH='200px'>
                    <ImageCard src={data.xyProj} title='XY Projection' />
                  </GridItem>
                  <GridItem colSpan={{ base: 4, md: 1 }} minW='100%' h='22vh' minH='200px'>
                    <PlotContainer title='Shift Plot'>
                      <ScatterPlot data={data.shiftPlot} />
                    </PlotContainer>
                  </GridItem>
                  <GridItem colSpan={{ base: 4, md: 2 }} h='22vh' minH='200px'>
                    <ImageCard src={data.xzProj} title='XZ Projection' />
                  </GridItem>
                </Grid>
              </Box>
              {checkRecipe(recipes[0], procJob) && (
                <CTF parentId={data.tomogram.tomogramId} parentType='tomograms' />
              )}
            </Grid>
          )}
        </AccordionPanel>
      )}
    </AccordionItem>
  );
};

export { Tomogram };
