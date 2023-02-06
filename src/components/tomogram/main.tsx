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
} from "@chakra-ui/react";
import { ImageCard } from "../visualisation/image";
import { InfoGroup } from "../visualisation/infogroup";
import { PlotContainer } from "../visualisation/plotContainer";
import { Motion } from "../motion/motion";
import { useEffect, useState } from "react";
import { client } from "../../utils/api/client";
import { TomogramData, BasePoint, BaseProcessingJobProps, DataConfig } from "../../schema/interfaces";
import { CTF } from "../ctf/ctf";
import { Scatter } from "../plots/scatter";
import { APNGViewer } from "../visualisation/apng";
import { setImage } from "../../utils/api/response";
import { components } from "../../schema/main";
import { ProcessingTitle } from "../visualisation/processingTitle";
import { parseData } from "../../utils/generic";

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

const Tomogram = ({ autoProc, procJob, status, active = false }: BaseProcessingJobProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [sliceImage, setSliceImage] = useState<string>();
  const [xyProjImage, setXyProjImage] = useState<string>();
  const [xzProjImage, setXzProjImage] = useState<string>();
  const [shiftData, setShiftData] = useState<BasePoint[]>([]);
  const [tomogram, setTomogram] = useState<TomogramData | null>();

  useEffect(() => {
    client.safe_get(`autoProc/${autoProc.autoProcProgramId}/tomogram`).then((response) => {
      if (response.status === 200) {
        const tomogram = response.data as components["schemas"]["TomogramOut"];

        setImage(`tomograms/${tomogram.tomogramId}/centralSlice`, setSliceImage);
        setImage(`tomograms/${tomogram.tomogramId}/projection?axis=xy`, setXyProjImage);
        setImage(`tomograms/${tomogram.tomogramId}/projection?axis=xz`, setXzProjImage);

        client.safe_get(`tomograms/${tomogram.tomogramId}/shiftPlot`).then((response) => {
          if (response.status === 200 && response.data.items) {
            setShiftData(response.data.items);
          }
        });

        setTomogram(parseData(tomogram, tomogramConfig) as TomogramData);
      } else {
        setTomogram(null);
      }
    });
  }, [autoProc]);

  return (
    <AccordionItem isDisabled={false}>
      <ProcessingTitle autoProc={autoProc} procJob={procJob} status={status} />
      {active && (
        <AccordionPanel pt={4}>
          {tomogram === null ? (
            <Motion parentId={procJob.dataCollectionId} parentType='dataCollections' />
          ) : tomogram === undefined ? (
            <VStack h='82vh' w='100%' spacing={2}>
              <Skeleton w='100%' h='22vh' />
              <Skeleton w='100%' h='20vh' />
              <Skeleton w='100%' h='20vh' />
              <Skeleton w='100%' h='20vh' />
            </VStack>
          ) : (
            <Grid gap={3}>
              <GridItem>
                <Motion parentType='tomograms' parentId={tomogram.tomogramId} />
              </GridItem>
              <GridItem>
                <Heading variant='collection'>Alignment</Heading>
                <Divider />
                <Grid py={2} templateColumns='repeat(3, 1fr)' gap={2}>
                  <GridItem height='20vh'>
                    <InfoGroup info={tomogram.info} />
                  </GridItem>
                  <GridItem height='20vh'>
                    <ImageCard height='85%' title='Central Slice' src={sliceImage} />
                    <Button w='100%' mt='1%' height='13%' alignSelf='end' size='sm' onClick={onOpen}>
                      View Movie
                    </Button>
                  </GridItem>
                  <GridItem height='20vh'>
                    <ImageCard src={xyProjImage} title='XY Projection' />
                  </GridItem>
                  <GridItem colSpan={{ base: 3, md: 1 }} minW='100%' height='22vh'>
                    <PlotContainer title='Shift Plot'>
                      <Scatter data={shiftData} />
                    </PlotContainer>
                  </GridItem>
                  <GridItem colSpan={2} height='22vh'>
                    <ImageCard src={xzProjImage} title='XZ Projection' />
                  </GridItem>
                </Grid>
              </GridItem>
              <GridItem>
                <CTF parentId={tomogram.tomogramId} parentType='tomograms' />
              </GridItem>
            </Grid>
          )}
        </AccordionPanel>
      )}
      {tomogram && isOpen && (
        <Modal size='xl' isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent minW={{ base: "95vh", md: "65vh" }}>
            <ModalHeader paddingBottom={0}>Movie</ModalHeader>
            <ModalCloseButton />
            <ModalBody h={{ base: "90vh", md: "60vh" }}>
              <APNGViewer src={`tomograms/${tomogram.tomogramId}/movie`} />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </AccordionItem>
  );
};

export { Tomogram };
