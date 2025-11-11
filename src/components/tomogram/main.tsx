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
import { useCallback, useState } from "react";
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
import { ScatterPlot, InfoGroup, ImageCard, BasePoint } from "@diamondlightsource/ui-components";

const tomogramConfig: DataConfig = {
  include: [
    { name: "stackFile" },
    { name: "tiltAngleOffset", unit: "°" },
    { name: "zShift" },
    { name: "volumeFile" },
    { name: "pixelSpacing" },
    { name: "refinedTiltAxis", unit: "°" },
  ],
  root: ["dataCollectionId", "tomogramId"],
};

interface FullTomogramData {
  tomogram: TomogramData | null;
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

const fetchTomogramData = async (tomogram: TomogramResponse | null) => {
  let data: FullTomogramData = {
    tomogram: null,
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
  const [selectedTomogram, setSelectedTomogram] = useState<TomogramMovieTypes>("segmented");
  const [isLargeScreen] = useMediaQuery("(min-width: 1500px)");

  const handleOpenTomogram = useCallback(
    (type: TomogramMovieTypes) => {
      onTomogramOpened(data!.tomogram!.tomogramId, type);
    },
    [data, onTomogramOpened]
  );

  const handleTomogramSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value as TomogramMovieTypes;
    setSelectedTomogram(value);
  };

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
          ) : !data || data.tomogram === null ? (
            <Box>
              <Motion parentId={procJob.dataCollectionId} parentType='tomograms' />
            </Box>
          ) : (
            <Grid gap={3} templateColumns={{ base: "", "2xl": "repeat(2, 1fr)" }}>
              <Box minW='0'>
                <Heading variant='collection'>Alignment</Heading>
                <Divider />
                <Grid
                  py={2}
                  templateColumns={{ base: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }}
                  gap={2}
                >
                  <GridItem
                    h='20vh'
                    minH={{ sm: "200px", md: "300px" }}
                    colSpan={{ base: 2, md: 1 }}
                  >
                    <InfoGroup info={data.tomogram.info} />
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 3 }} h='20vh' minH='300px'>
                    <Card h='100%'>
                      <CardHeader>
                        <HStack>
                          <Heading size='sm'>Central Slice</Heading>
                          <Spacer />
                          {isLargeScreen ? (
                            <>
                              <Button
                                h='25px'
                                size='sm'
                                onClick={() => handleOpenTomogram("picked")}
                              >
                                View Picked
                                <Spacer />
                                <Icon ml='10px' as={MdOpenInNew}></Icon>
                              </Button>
                              <Button
                                h='25px'
                                size='sm'
                                onClick={() => handleOpenTomogram("segmented")}
                              >
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
                                  <option value='picked'>Picked</option>
                                </Select>
                              </Tooltip>
                              <Button
                                h='25px'
                                size='sm'
                                onClick={() => handleOpenTomogram(selectedTomogram)}
                              >
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
                        <HStack
                          mx='auto'
                          w='auto'
                          h='100%'
                          divider={<Divider orientation='vertical' />}
                        >
                          {isLargeScreen ? (
                            [
                              <TomogramThumbnail
                                key='picked'
                                baseUrl={data.centralSlice}
                                movieType='picked'
                              />,
                              <TomogramThumbnail
                                key='segmented'
                                baseUrl={data.centralSlice}
                                movieType='segmented'
                              />,
                            ]
                          ) : (
                            <TomogramThumbnail
                              key={selectedTomogram}
                              baseUrl={data.centralSlice}
                              movieType={selectedTomogram}
                            />
                          )}
                          <TomogramThumbnail
                            key='denoised'
                            baseUrl={data.centralSlice}
                            movieType='denoised'
                          />
                          <TomogramThumbnail
                            key='noisy'
                            baseUrl={data.centralSlice}
                            movieType={null}
                          />
                        </HStack>
                      </CardBody>
                    </Card>
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }} h='22vh' minH='200px'>
                    <ImageCard src={data.xyProj} title='XY Projection' />
                  </GridItem>
                  <GridItem colSpan={{ base: 2, md: 1 }} minW='100%' h='22vh' minH='200px'>
                    <PlotContainer title='Shift Plot'>
                      <ScatterPlot data={data.shiftPlot} />
                    </PlotContainer>
                  </GridItem>
                  <GridItem colSpan={2} h='22vh' minH='200px'>
                    <ImageCard src={data.xzProj} title='XZ Projection' />
                  </GridItem>
                </Grid>
              </Box>
              <CTF parentId={data.tomogram.tomogramId} parentType='tomograms' />
            </Grid>
          )}
        </AccordionPanel>
      )}
    </AccordionItem>
  );
};

export { Tomogram };
