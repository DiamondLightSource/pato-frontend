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
  Tooltip,
  Button,
} from "@chakra-ui/react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { useLoaderData, useLocation, useNavigate, useParams } from "react-router-dom";
import { components } from "../schema/main";
import { SPA } from "../components/spa/main";
import { MdFolder } from "react-icons/md";
import { InfoGroup } from "../components/visualisation/infogroup";
import { RelionReprocessing } from "../components/spa/relion";
import { MdRedo } from "react-icons/md";
import { SpaCollectionData } from "../schema/interfaces";
import React from "react";

const Statistics = React.lazy(() => import("../components/spa/statistics"));
type ProcessingJob = components["schemas"]["ProcessingJobResponse"];

const SpaPage = () => {
  const params = useParams();
  const loaderData = useLoaderData() as { collection: SpaCollectionData; jobs: ProcessingJob[] | null };
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
    document.title = `PATo ?? SPA ?? ${params.groupId}`;
  }, [params]);

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack w='100%'>
          <HStack w='100%'>
            <Heading>Data Collection</Heading>
            <Tag colorScheme='orange'>SPA</Tag>
            <Spacer />
            <Tooltip label='Run Reprocessing'>
              <Button isDisabled>
                <Icon as={MdRedo} />
              </Button>
            </Tooltip>
          </HStack>
          <HStack w='100%'>
            <Heading color='diamond.300' size='sm'>
              Proposal <Code>{params.propId}</Code>, visit <Code>{params.visitId}</Code>, data collection group{" "}
              <Code>{params.groupId}</Code>, data collection <Code>{loaderData.collection.dataCollectionId}</Code>
            </Heading>
            <Spacer />
            <Tag bg='diamond.100'>
              <Icon as={MdFolder} />
              <Text px={3} fontSize={12}>{`.../${loaderData.collection.fileTemplate}`}</Text>
            </Tag>
          </HStack>
        </VStack>
      </HStack>

      <InfoGroup cols={6} info={loaderData.collection.info} />
      <Divider my={2} />
      <Tabs isLazy onChange={handleTabChanged} index={tabIndex}>
        <TabList>
          <Tab>Processing Jobs</Tab>
          <Tab>Collection Statistics</Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            {loaderData.jobs && loaderData.jobs.length > 0 ? (
              <Accordion onChange={setAccordionIndex} index={accordionIndex} allowToggle>
                {loaderData.jobs.map((job, i) => (
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
              <VStack>
                <Heading pt={5} variant='notFound'>
                  No Single Particle Analysis Data Available
                </Heading>
                <Heading w='50%' pb={5} variant='notFoundSubtitle'>
                  ...or you may not have permission to view data in this collection. If this was shared with you through
                  a link, check with the person that sent it.
                </Heading>
              </VStack>
            )}
          </TabPanel>
          <TabPanel>
            {loaderData.collection.dataCollectionId ? (
              <Suspense>
                <Statistics dataCollectionId={loaderData.collection.dataCollectionId} />
              </Suspense>
            ) : null}
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
