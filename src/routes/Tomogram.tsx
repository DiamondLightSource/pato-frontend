import {
  Divider,
  Heading,
  Box,
  VStack,
  Code,
  HStack,
  Spacer,
  Checkbox,
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
import { MdList, MdRedo } from "react-icons/md";
import React from "react";
import { TomogramResponse } from "loaders/tomogram";
import APNGContainer from "components/visualisation/apngContainer";
import { Flipper, InfoGroup, APNGViewer } from "@diamondlightsource/ui-components";
import { prependApiUrl } from "utils/api/client";
import { CollectionTitle } from "components/visualisation/collectionTitle";

const TomogramReprocessing = React.lazy(() => import("components/tomogram/reprocessing"));

const TomogramPage = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const loaderData = useLoaderData() as TomogramResponse;

  const { isOpen, onOpen, onClose } = useDisclosure();

  const [accordionIndex, setAccordionIndex] = useState<number | number[]>(0);
  const [openTomogram, setOpenTomogram] = useState<number | null>(null);

  const onlyTomograms = useMemo(() => searchParams.get("onlyTomograms") === "true", [searchParams]);
  const sortBy = useMemo(() => searchParams.get("sortBy"), [searchParams]);
  const currentIndex = useMemo(() => parseInt(params.collectionIndex ?? "1"), [params]);
  const tomogramMovieSrc = useMemo(
    () => prependApiUrl(`tomograms/${openTomogram}/movie`),
    [openTomogram]
  );

  const handleCollectionChanged = useCallback(
    (page: number) => {
      navigate({ pathname: `../${page}`, search: window.location.search }, { relative: "path" });
    },
    [navigate]
  );

  const updateTomogramFilter = useCallback(() => {
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev),
      onlyTomograms: (!(prev.get("onlyTomograms") === "true")).toString(),
    }));
  }, [setSearchParams]);

  const updateTomogramSort = useCallback(() => {
    setSearchParams((prev) => ({
      ...Object.fromEntries(prev),
      sortBy: prev.get("sortBy") ? "" : "globalAlignmentQuality",
    }));
  }, [setSearchParams]);

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

  const buttonDisabled = useMemo(() => {
    if (
      loaderData.tomograms === null ||
      !loaderData.collection.dataCollectionId ||
      !loaderData.allowReprocessing
    ) {
      return true;
    }

    const totalSucceeded = loaderData.tomograms.reduce(
      (total, job) => total + (job.status === "Success" ? 1 : 0),
      0
    );

    if (totalSucceeded > 2 || totalSucceeded === 0) {
      return true;
    }

    return false;
  }, [loaderData]);

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack w='100%'>
          <Stack w='100%' direction={{ base: "column", md: "row" }}>
            <CollectionTitle
              title={loaderData.collection.comments}
              colorScheme='teal'
              type='Tomogram'
            />
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
              <Flipper
                size='md'
                onChangeEnd={handleCollectionChanged}
                defaultPage={currentIndex}
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
              mr='1em'
            >
              Only show processed tomograms
            </Checkbox>

            <Checkbox
              data-testid='sort-tomograms'
              isChecked={!!sortBy}
              onChange={updateTomogramSort}
              alignSelf='end'
            >
              Sort by quality
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
              key={`${job.AutoProcProgram.autoProcProgramId}-${i}`}
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
                <Flipper
                  size='md'
                  onChangeEnd={handleCollectionChanged}
                  defaultPage={currentIndex}
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
