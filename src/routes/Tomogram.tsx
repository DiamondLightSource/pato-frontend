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
  Stack,
} from "@chakra-ui/react";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Tomogram } from "components/tomogram/main";
import { MotionPagination } from "components/motion/pagination";
import { InfoGroup } from "components/visualisation/infogroup";
import { MdList, MdRedo } from "react-icons/md";
import React from "react";
import { TomogramResponse } from "loaders/tomogram";
import APNGContainer from "components/visualisation/apngContainer";

const TomogramReprocessing = React.lazy(() => import("components/tomogram/reprocessing"));
const APNGViewer = React.lazy(() => import("components/visualisation/apng"));

const TomogramPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const loaderData = useLoaderData() as TomogramResponse;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [accordionIndex, setAccordionIndex] = useState<number | number[]>(0);
  const [openTomogram, setOpenTomogram] = useState<number | null>(null);

  const onlyTomograms = useMemo(() => searchParams.get("onlyTomograms") === "true", [searchParams]);
  const currentIndex = useMemo(() => parseInt(params.collectionIndex ?? "1"), [params]);
  const tomogramMovieSrc = useMemo(() => `tomograms/${openTomogram}/movie`, [openTomogram]);

  const updateCollection = useCallback(
    (page: number) => {
      navigate(
        { pathname: `../${page}`, search: `onlyTomograms=${onlyTomograms}` },
        { relative: "path" }
      );
    },
    [navigate, onlyTomograms]
  );

  const updateTomogramFilter = useCallback(() => {
    setSearchParams({ onlyTomograms: (!onlyTomograms).toString() });
  }, [setSearchParams, onlyTomograms]);

  useEffect(() => {
    document.title = `PATo » Tomograms » ${params.collectionIndex}`;
  }, [params]);

  useEffect(() => {
    setOpenTomogram((prevState) =>
      prevState !== null && loaderData.tomograms && loaderData.tomograms[0].Tomogram
        ? loaderData.tomograms[0].Tomogram.tomogramId
        : null
    );
  }, [loaderData]);

  // TODO: Enable this once reprocessing is released
  const buttonDisabled = useMemo(
    () => {
      return true;
      /*if (loaderData.tomograms === null || !loaderData.collection.dataCollectionId) {
      return true;
    }

    return false;

    const totalSucceeded = loaderdata.tomograms.reduce((total, job) => total + (job.status === "Success" ? 1 : 0), 0);

    if (totalSucceeded > 2 || totalSucceeded === 0) {
      return true;
    }

    return false;*/
    },
    [
      /*loaderData.tomograms*/
    ]
  );

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack w='100%'>
          <Stack w='100%' direction={{ base: "column", md: "row" }}>
            <HStack>
              <Heading>{loaderData.collection.comments}</Heading>
              <Tag colorScheme='teal'>Tomogram</Tag>
            </HStack>
            <Spacer />
            <HStack>
              <Tooltip label='Run Reprocessing'>
                <Button aria-label='Run Reprocessing' onClick={onOpen} isDisabled={buttonDisabled}>
                  <Icon as={MdRedo} />
                </Button>
              </Tooltip>
              <Tooltip label='List Collections'>
                <Button
                  aria-label='List Collections'
                  onClick={() => navigate("../../collections", { relative: "path" })}
                >
                  <Icon as={MdList} />
                </Button>
              </Tooltip>
              <Divider orientation='vertical' h={10} />
              <MotionPagination
                size='md'
                onChange={updateCollection}
                page={currentIndex}
                total={loaderData.total}
              />
            </HStack>
          </Stack>
          <HStack w='100%'>
            <Heading color='diamond.300' size='sm'>
              Proposal <Code>{params.propId}</Code>, visit <Code>{params.visitId}</Code>, data
              collection group <Code>{params.groupId}</Code>
            </Heading>
            <Spacer />
            <Checkbox
              data-testid='filter-tomograms'
              isChecked={onlyTomograms}
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
      {loaderData.tomograms ? (
        <Accordion onChange={setAccordionIndex} index={accordionIndex} allowToggle>
          {loaderData.tomograms.map((job, i) => (
            <Tomogram
              key={job.AutoProcProgram.autoProcProgramId}
              autoProc={job.AutoProcProgram}
              procJob={job.ProcessingJob}
              tomogram={job.Tomogram || null}
              status={job.status}
              active={accordionIndex === i}
              onTomogramOpened={setOpenTomogram}
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
              <Suspense>
                <TomogramReprocessing
                  collectionId={loaderData.collection.dataCollectionId}
                  pixelSize={loaderData.collection.pixelSizeOnImage}
                  onClose={onClose}
                />
              </Suspense>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}

      {openTomogram && (
        <Modal size='6xl' isOpen onClose={() => setOpenTomogram(null)}>
          <ModalOverlay />
          <ModalContent minW={{ base: "95vh", md: "65vh" }}>
            <ModalHeader paddingBottom={0}>Movie</ModalHeader>
            <ModalCloseButton />
            <ModalBody h={{ base: "90vh", md: "60vh" }}>
              <HStack>
                <Spacer />
                <MotionPagination
                  size='md'
                  onChange={updateCollection}
                  page={currentIndex}
                  total={loaderData.total}
                />
              </HStack>
              <Suspense>
                <APNGContainer>
                  <APNGViewer caption='Denoised' src={`${tomogramMovieSrc}?denoised=true`} />
                  <APNGViewer caption='Not Denoised' src={tomogramMovieSrc} />
                </APNGContainer>
              </Suspense>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export { TomogramPage };
