import {
  Text,
  Heading,
  Box,
  VStack,
  Code,
  HStack,
  Accordion,
  Spacer,
  Divider,
  Icon,
  Skeleton,
  Grid,
  Tag,
  useDisclosure,
  Modal,
  ModalHeader,
  ModalBody,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { client } from "../utils/api/client";
import { parseData } from "../utils/generic";
import { CollectionData, DataConfig } from "../schema/interfaces";
import { components } from "../schema/main";
import { buildEndpoint } from "../utils/api/endpoint";
import { SPA } from "../components/spa/main";
import { collectionConfig } from "../utils/config/parse";
import { MdFolder } from "react-icons/md";
import { InfoGroup } from "../components/visualisation/infogroup";
import { RelionReprocessing } from "../components/spa/relion";
import { Statistics } from "../components/spa/statistics";

type ProcessingJob = components["schemas"]["ProcessingJobOut"];
type DataCollection = components["schemas"]["DataCollectionSummaryOut"];

const spaCollectionConfig: DataConfig = {
  include: [
    ...collectionConfig.include,
    ...[
      { name: "totalExposedDose", label: "Total Dose", unit: "e⁻/Å²" },
      { name: "numberOfImages", label: "Number of Movies" },
      { name: "exposureTime", label: "Total Exposure Time", unit: "seconds" },
      { name: "frameLength", unit: "seconds" },
      { name: "phasePlate", label: "Phase Plate Used" },
      { name: "c2lens", label: "C2 Lens", unit: "%" },
      { name: "c2aperture", label: "C2 Aperture", unit: "μm" },
      { name: "magnification" },
      { name: ["beamSizeAtSampleX, beamSizeAtSampleY"], unit: "μm", label: "Illuminated Area" },
      { name: "frameDose", unit: "e⁻/Å²" },
      { name: "slitGapHorizontal", label: "Energy Filter / Slit Width", unit: "eV" },
      { name: "detectorMode" },
    ],
  ],
  root: [...(collectionConfig.root ?? []), "fileTemplate", "imageDirectory"],
};

const getAcquisitionSoftware = (fileTemplate: string) => {
  if (fileTemplate.includes("GridSquare_")) {
    return "EPU";
  }

  if (fileTemplate.includes("Frames/")) {
    return "SerialEM";
  }

  return "";
};

interface SpaCollectionData extends CollectionData {
  fileTemplate: string;
  imageDirectory: string;
}

const SpaPage = () => {
  const params = useParams();
  const [collectionData, setCollectionData] = useState<SpaCollectionData>({
    info: [],
    comments: "",
    fileTemplate: "",
    imageDirectory: "",
  });
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const [processingJobToEdit, setProcessingJobToEdit] = useState<number | null>(null);
  const [accordionIndex, setAccordionIndex] = useState<number | number[]>(0);
  const [tabIndex, setTabIndex] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleProcessingClicked = useCallback(
    (procJobId: number) => {
      setProcessingJobToEdit(procJobId);
      onOpen();
    },
    [onOpen, setProcessingJobToEdit]
  );

  useEffect(() => {
    if (location.hash === "#statistics") {
      setTabIndex(1);
    }
  }, [location]);

  const handleTabChanged = useCallback(
    (index: number) => {
      if (index === 1) {
        navigate("#statistics");
      } else {
        navigate("");
        setTabIndex(index);
      }
    },
    [navigate]
  );

  useEffect(() => {
    document.title = `PATo » SPA » ${params.groupId}`;

    client.safe_get(buildEndpoint("dataCollections", params, 1, 1)).then((response) => {
      if (response.data.items) {
        const data = response.data.items[0] as DataCollection;
        const parsedData = parseData(data, spaCollectionConfig) as SpaCollectionData;

        parsedData.info.unshift({ label: "Acquisition Software", value: getAcquisitionSoftware(data.fileTemplate) });
        parsedData.info.push({ label: "Comments", value: getAcquisitionSoftware(data.comments ?? ""), wide: true });
        setCollectionData(parsedData);
      }
    });
  }, [params, navigate]);

  useEffect(() => {
    const collectionId = collectionData.dataCollectionId;
    if (collectionId !== undefined) {
      client
        .safe_get(buildEndpoint("processingJobs", { collectionId: collectionId.toString() }, 25, 1))
        .then((response) => {
          if (response.data.items) {
            setProcessingJobs(response.data.items);
          }
        });
    }
  }, [collectionData, params]);

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack w='100%'>
          <HStack w='100%'>
            <Heading>Data Collection</Heading>
            <Tag colorScheme='orange'>SPA</Tag>
            <Spacer />
          </HStack>
          <HStack w='100%'>
            <Heading color='diamond.300' size='sm'>
              Proposal <Code>{params.propId}</Code>, visit <Code>{params.visitId}</Code>, data collection group{" "}
              <Code>{params.groupId}</Code>, data collection <Code>{collectionData.dataCollectionId}</Code>
            </Heading>
            <Spacer />
            <Tag bg='diamond.100'>
              <Icon as={MdFolder} />
              <Text px={3} fontSize={12}>{`.../${collectionData.fileTemplate}`}</Text>
            </Tag>
          </HStack>
        </VStack>
      </HStack>

      <InfoGroup cols={6} info={collectionData.info} />
      <Divider marginY={2} />
      <Tabs isLazy onChange={handleTabChanged} index={tabIndex}>
        <TabList>
          <Tab>Processing Jobs</Tab>
          <Tab isDisabled>Collection Statistics</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {processingJobs.length ? (
              <Accordion onChange={setAccordionIndex} index={accordionIndex} allowToggle>
                {processingJobs.map((job, i) => (
                  /* isExpanded is not to be trusted */
                  <SPA
                    key={i}
                    active={accordionIndex === i}
                    autoProc={job.AutoProcProgram}
                    procJob={job.ProcessingJob}
                    status={job.status}
                    onReprocessingClicked={handleProcessingClicked}
                  />
                ))}
              </Accordion>
            ) : (
              <Grid gap={3}>
                <Skeleton h='4vh' />
                <Skeleton h='25vh' />
                <Skeleton h='25vh' />
                <Skeleton h='20vh' />
              </Grid>
            )}
          </TabPanel>
          <TabPanel>
            {collectionData.dataCollectionId ? <Statistics dataCollectionId={collectionData.dataCollectionId} /> : null}
          </TabPanel>
        </TabPanels>
      </Tabs>

      {processingJobToEdit && (
        <Modal size='6xl' isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Heading size='md'>Relion Processing</Heading>
              <ModalCloseButton />
            </ModalHeader>
            <Divider />
            <ModalBody p={0}>
              <RelionReprocessing procJobId={processingJobToEdit} />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export { SpaPage };
