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
  Skeleton,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useLoaderData, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Tomogram } from "../components/tomogram/main";
import { CollectionData } from "../schema/interfaces";
import { MotionPagination } from "../components/motion/pagination";
import { InfoGroup } from "../components/visualisation/infogroup";
import { MdList, MdRedo } from "react-icons/md";
import { components } from "../schema/main";

type ProcessingJob = components["schemas"]["ProcessingJobOut"];

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

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack w='100%'>
          <HStack w='100%'>
            <Heading>{loaderData.collection.comments}</Heading>
            <Tag colorScheme='teal'>Tomogram</Tag>
            <Spacer />
            <Tooltip label='Run Reprocessing'>
              <Button isDisabled>
                <Icon as={MdRedo} />
              </Button>
            </Tooltip>
            <Tooltip label='List Collections'>
              <Button onClick={() => navigate("../../collections", { relative: "path" })}>
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
            <Checkbox defaultChecked={onlyProcessed} onChange={updateTomogramFilter} alignSelf='end'>
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
        <Skeleton h='33vh' w='100%' />
      )}
    </Box>
  );
};

export { TomogramPage };
