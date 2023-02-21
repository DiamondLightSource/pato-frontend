import {
  Divider,
  Heading,
  Box,
  VStack,
  Code,
  HStack,
  Spacer,
  Checkbox,
  Tag,
  Icon,
  Button,
  Tooltip,
  Accordion,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Tomogram } from "../components/tomogram/main";
import { CollectionData } from "../schema/interfaces";
import { MotionPagination } from "../components/motion/pagination";
import { InfoGroup } from "../components/visualisation/infogroup";
import { MdList, MdRedo } from "react-icons/md";
import { components } from "../schema/main";
import { TomogramReprocessing } from "../components/tomogram/reprocessing";

type ProcessingJob = components["schemas"]["ProcessingJobResponse"];

const TomogramPage = () => {
  const params = useParams();
  const loaderData = useLoaderData() as {
    collection: CollectionData;
    total: number;
    page: number;
    jobs: ProcessingJob[] | null;
  };
  const [searchParams, setSearchParams] = useSearchParams();
  const [onlyProcessed, setOnlyProcessed] = useState(searchParams.get("onlyTomograms") === "true");
  const [accordionIndex, setAccordionIndex] = useState<number | number[]>(0);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const navigate = useNavigate();

  const updateCollection = useCallback(
    (page: number) => {
      navigate(`../${page}?onlyTomograms=${onlyProcessed}`, { relative: "path" });
    },
    [navigate, onlyProcessed]
  );

  const updateTomogramFilter = useCallback(() => {
    setOnlyProcessed(!onlyProcessed);
    setSearchParams({ onlyTomograms: (!onlyProcessed).toString() });
  }, [onlyProcessed, setSearchParams]);

  useEffect(() => {
    document.title = `PATo » Tomograms » ${params.collectionIndex}`;
  }, [params]);

  const buttonDisabled = useMemo(() => {
    return true;
    if (loaderData.jobs === null || !loaderData.collection.dataCollectionId) {
      return true;
    }

    return false;

    /*

    const totalSucceeded = loaderData.jobs.reduce((total, job) => total + (job.status === "Success" ? 1 : 0), 0);

    if (totalSucceeded > 2 || totalSucceeded === 0) {
      return true;
    }

    return false;*/
  }, [loaderData.jobs]);

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack w='100%'>
          <HStack w='100%'>
            <Heading>{loaderData.collection.comments}</Heading>
            <Tag colorScheme='teal'>Tomogram</Tag>
            <Spacer />
            <Tooltip label='Run Reprocessing'>
              <Button aria-label='Run Reprocessing' onClick={onOpen} isDisabled={buttonDisabled}>
                <Icon as={MdRedo} />
              </Button>
            </Tooltip>
            <Tooltip label='List Collections'>
              <Button aria-label='List Collections' onClick={() => navigate("../../collections", { relative: "path" })}>
                <Icon as={MdList} />
              </Button>
            </Tooltip>
            <Divider orientation='vertical' h='5vh' />
            <MotionPagination
              size='md'
              onChange={updateCollection}
              displayDefault={parseInt(params.collectionIndex ?? "1")}
              total={loaderData.total}
            />
          </HStack>
          <HStack w='100%'>
            <Heading color='diamond.300' size='sm'>
              Proposal <Code>{params.propId}</Code>, visit <Code>{params.visitId}</Code>, data collection group{" "}
              <Code>{params.groupId}</Code>
            </Heading>
            <Spacer />
            <Checkbox
              data-testid='filter-tomograms'
              defaultChecked={onlyProcessed}
              onChange={updateTomogramFilter}
              alignSelf='end'
            >
              Only show processed tomograms
            </Checkbox>
          </HStack>
        </VStack>
      </HStack>
      <InfoGroup cols={3} info={loaderData.collection.info} />
      <Divider my={2} />
      {loaderData.jobs ? (
        <Accordion onChange={setAccordionIndex} index={accordionIndex} allowToggle>
          {loaderData.jobs.map((job, i) => (
            <Tomogram
              key={job.AutoProcProgram.autoProcProgramId}
              autoProc={job.AutoProcProgram}
              procJob={job.ProcessingJob}
              status={job.status}
              active={accordionIndex === i}
            />
          ))}
        </Accordion>
      ) : (
        <Heading variant='notFound'>No Jobs Available for This Data Collection</Heading>
      )}
      {loaderData.collection.dataCollectionId && (
        <Modal size='2xl' isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Heading size='md'>Reprocessing</Heading>
              <ModalCloseButton />
            </ModalHeader>
            <Divider />
            <ModalBody p={0}>
              <TomogramReprocessing
                collectionId={loaderData.collection.dataCollectionId}
                pixelSize={loaderData.collection.pixelSizeOnImage}
                onClose={onClose}
              />
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export { TomogramPage };
