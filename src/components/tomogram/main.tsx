import {
  Divider,
  Grid,
  Button,
  Heading,
  GridItem,
  useDisclosure,
  ModalContent,
  Modal,
  ModalCloseButton,
  ModalOverlay,
  ModalHeader,
  ModalBody,
  AccordionItem,
  AccordionPanel,
  Skeleton,
  VStack,
  Spacer,
  Icon,
} from "@chakra-ui/react";
import { ImageCard } from "components/visualisation/image";
import { InfoGroup } from "components/visualisation/infogroup";
import { PlotContainer } from "components/visualisation/plotContainer";
import { Motion } from "components/motion/motion";
import { Suspense, useMemo } from "react";
import { client } from "utils/api/client";
import { TomogramData, BasePoint, BaseProcessingJobProps, DataConfig } from "schema/interfaces";
import { CTF } from "components/ctf/ctf";
import { Scatter } from "components/plots/scatter";
import { getImage } from "utils/api/response";
import { components } from "schema/main";
import { ProcessingTitle } from "components/visualisation/processingTitle";
import { parseData } from "utils/generic";
import React from "react";
import { MdOpenInNew } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";

const APNGViewer = React.lazy(() => import("components/visualisation/apng"));

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
  centralSlice: Blob;
  xyProj: Blob;
  xzProj: Blob;
  shiftPlot: BasePoint[];
}

const fetchTomogramData = async (autoProcProgramId: number) => {
  let data: FullTomogramData = { tomogram: null, centralSlice: new Blob(), xyProj: new Blob(), xzProj: new Blob(), shiftPlot: [] };
  const response = await client.safeGet(`autoProc/${autoProcProgramId}/tomogram`);
  if (response.status === 200) {
    const tomogram = response.data as components["schemas"]["TomogramResponse"];

    const fileData = await Promise.all([
      client.safeGet(`tomograms/${tomogram.tomogramId}/centralSlice`),
      client.safeGet(`tomograms/${tomogram.tomogramId}/projection?axis=xy`),
      client.safeGet(`tomograms/${tomogram.tomogramId}/projection?axis=xz`),
      client.safeGet(`tomograms/${tomogram.tomogramId}/shiftPlot`),
    ]);

    data = {
      ...data,
      tomogram: parseData(tomogram, tomogramConfig) as TomogramData,
      centralSlice: fileData[0].data as Blob,
      xyProj: fileData[1].data as Blob,
      xzProj: fileData[2].data as Blob,
    };

    if (fileData[3].status === 200 && fileData[3].data.items) {
      data.shiftPlot = fileData[3].data.items;
    }
  }

  return data;
};

const Tomogram = ({ autoProc, procJob, status, active = false }: BaseProcessingJobProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const { data, isLoading } = useQuery({
    queryKey: ["tomogramAutoProc", autoProc.autoProcProgramId],
    queryFn: async () => await fetchTomogramData(autoProc.autoProcProgramId),
    staleTime: 3000000
  });

  const sliceImage = useMemo(() => data ? getImage(data.centralSlice) : "", [data])
  const xyProjImage = useMemo(() => data ? getImage(data.xyProj) : "", [data])
  const xzProjImage = useMemo(() => data ? getImage(data.xzProj) : "", [data])

  return (
    <AccordionItem isDisabled={false}>
      <ProcessingTitle autoProc={autoProc} procJob={procJob} status={status} />
      {active && data && (
        <AccordionPanel p={0}>
          {isLoading ? (
            <VStack h='82vh' w='100%' spacing={2}>
              <Skeleton w='100%' h='22vh' />
              <Skeleton w='100%' h='20vh' />
              <Skeleton w='100%' h='20vh' />
              <Skeleton w='100%' h='20vh' />
            </VStack>
          ) : data.tomogram === null ? (
            <Motion parentId={procJob.dataCollectionId} parentType='dataCollections' />
          ) : (
            <Grid gap={3} bg='diamond.75' p={4} templateColumns={{ "base": "", "2xl": "repeat(2, 1fr)" }}>
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
                    <ImageCard height='85%' title='Central Slice' src={sliceImage} />
                    <Button w='100%' mt='1%' height='13%' alignSelf='end' size='sm' onClick={onOpen}>
                      View Movie
                      <Spacer />
                      <Icon as={MdOpenInNew}></Icon>
                    </Button>
                  </GridItem>
                  <GridItem height='20vh'>
                    <ImageCard src={xyProjImage} title='XY Projection' />
                  </GridItem>
                  <GridItem colSpan={{ base: 3, md: 1 }} minW='100%' height='22vh'>
                    <PlotContainer title='Shift Plot'>
                      <Scatter data={data.shiftPlot} />
                    </PlotContainer>
                  </GridItem>
                  <GridItem colSpan={2} height='22vh'>
                    <ImageCard src={xzProjImage} title='XZ Projection' />
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
      {data && data.tomogram && isOpen && (
        <Modal size='xl' isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent minW={{ base: "95vh", md: "65vh" }}>
            <ModalHeader paddingBottom={0}>Movie</ModalHeader>
            <ModalCloseButton />
            <ModalBody h={{ base: "90vh", md: "60vh" }}>
              <Suspense>
                <APNGViewer src={`tomograms/${data.tomogram.tomogramId}/movie`} />
              </Suspense>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </AccordionItem>
  );
};

export { Tomogram };
