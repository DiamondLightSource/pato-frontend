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
} from "@chakra-ui/react";
import { ImageCard } from "components/visualisation/image";
import { InfoGroup } from "components/visualisation/infogroup";
import { PlotContainer } from "components/visualisation/plotContainer";
import { Motion } from "components/motion/motion";
import { useCallback } from "react";
import { client, prependApiUrl } from "utils/api/client";
import { TomogramData, BasePoint, BaseProcessingJobProps, DataConfig } from "schema/interfaces";
import { CTF } from "components/ctf/ctf";
import { Scatter } from "components/plots/scatter";
import { components } from "schema/main";
import { ProcessingTitle } from "components/visualisation/processingTitle";
import { parseData } from "utils/generic";
import { MdOpenInNew } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";

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
  onTomogramOpened: (tomogramId: number) => void;
}

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

const Tomogram = ({ autoProc, procJob, tomogram, status, onTomogramOpened, active = false }: TomogramProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["tomogramAutoProc", autoProc.autoProcProgramId],
    queryFn: async () => await fetchTomogramData(tomogram),
  });

  const handleOpenTomogram = useCallback(() => {
    onTomogramOpened(data!.tomogram!.tomogramId);
  }, [data, onTomogramOpened]);

  return (
    <AccordionItem isDisabled={false}>
      <ProcessingTitle autoProc={autoProc} procJob={procJob} status={status} />
      {active && (
        <AccordionPanel p={4}>
          {isLoading ? (
            <VStack h='82vh' w='100%' spacing={2}>
              <Skeleton w='100%' h='22vh' />
              <Skeleton w='100%' h='20vh' />
              <Skeleton w='100%' h='20vh' />
              <Skeleton w='100%' h='20vh' />
            </VStack>
          ) : !data || data.tomogram === null ? (
            <Box>
              <Motion parentId={procJob.dataCollectionId} parentType='dataCollections' />
            </Box>
          ) : (
            <Grid gap={3} bg='diamond.75' templateColumns={{ "base": "", "2xl": "repeat(2, 1fr)" }}>
              <GridItem>
                <Motion parentType='tomograms' parentId={data.tomogram.tomogramId} />
              </GridItem>
              <GridItem>
                <Heading variant='collection'>Alignment</Heading>
                <Divider />
                <Grid py={2} templateColumns='repeat(3, 1fr)' gap={2}>
                  <GridItem height='20vh'>
                    <InfoGroup info={data.tomogram.info} />
                  </GridItem>
                  <GridItem height='20vh'>
                    <ImageCard height='85%' title='Central Slice' src={data.centralSlice} />
                    <Button w='100%' mt='1%' height='13%' alignSelf='end' size='sm' onClick={handleOpenTomogram}>
                      View Movie
                      <Spacer />
                      <Icon as={MdOpenInNew}></Icon>
                    </Button>
                  </GridItem>
                  <GridItem height='20vh'>
                    <ImageCard src={data.xyProj} title='XY Projection' />
                  </GridItem>
                  <GridItem colSpan={{ base: 3, md: 1 }} minW='100%' height='22vh'>
                    <PlotContainer title='Shift Plot'>
                      <Scatter data={data.shiftPlot} />
                    </PlotContainer>
                  </GridItem>
                  <GridItem colSpan={2} height='22vh'>
                    <ImageCard src={data.xzProj} title='XZ Projection' />
                  </GridItem>
                </Grid>
              </GridItem>
              <GridItem>
                <CTF parentId={data.tomogram.tomogramId} parentType='tomograms' />
              </GridItem>
            </Grid>
          )}
        </AccordionPanel>
      )}
    </AccordionItem>
  );
};

export { Tomogram };
