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
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { client } from "../utils/api/client";
import { Tomogram } from "../components/tomogram/main";
import { parseData } from "../utils/generic";
import { CollectionData } from "../schema/interfaces";
import { MotionPagination } from "../components/motion/pagination";
import { InfoGroup } from "../components/visualisation/infogroup";
import { buildEndpoint } from "../utils/api/endpoint";
import { collectionConfig } from "../utils/config/parse";
import { MdList, MdRedo } from "react-icons/md";
import { components } from "../schema/main";

type ProcessingResponse = components["schemas"]["ProcessingJobOut"];

const TomogramPage = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<ProcessingResponse[] | null | undefined>();
  const [collectionData, setCollectionData] = useState<CollectionData>({ info: [], comments: "" });
  const [pageCount, setPageCount] = useState(1);
  const [onlyProcessed, setOnlyProcessed] = useState(searchParams.get("onlyProcessed") === "true");
  const [accordionIndex, setAccordionIndex] = useState<number | number[]>(0);
  const navigate = useNavigate();

  const updateCollection = useCallback(
    (page: number) => {
      navigate(`../${page}`, { relative: "path" });
    },
    [navigate]
  );

  const updateTomogramFilter = useCallback(() => {
    setOnlyProcessed(!onlyProcessed);
    setSearchParams({ onlyProcessed: (!onlyProcessed).toString() });
  }, [onlyProcessed, setSearchParams]);

  useEffect(() => {
    document.title = `PATo » Tomograms » ${params.collectionIndex}`;

    /** There should be 3 possible states: a null tomogram (for when it is still being processed),
    /* and undefined tomogram (waiting for information client-side) and a valid tomogram */
    setJobs(undefined);
    client
      .safe_get(
        `${buildEndpoint(
          "dataCollections",
          params,
          1,
          parseInt(params.collectionIndex ?? "1")
        )}&onlyTomograms=${onlyProcessed}`
      )
      .then((response) => {
        if (response.data.total && response.data.items) {
          setPageCount(response.data.total);
          if (params.collectionIndex && params.collectionIndex > response.data.total) {
            updateCollection(1);
          }
          setCollectionData(parseData(response.data.items[0], collectionConfig) as CollectionData);

          client
            .safe_get(`dataCollections/${response.data.items[0].dataCollectionId}/processingJobs?limit=3`)
            .then((response) => {
              if (response.status === 200 && response.data) {
                const items = response.data.items as ProcessingResponse[];
                setJobs(items);
              } else {
                setJobs(null);
              }
            });
        }
      });
  }, [params, navigate, updateCollection, onlyProcessed]);

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack w='100%'>
          <HStack w='100%'>
            <Heading>{collectionData.comments}</Heading>
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
              total={pageCount}
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
      <InfoGroup cols={3} info={collectionData.info} />
      <Divider my={2} />
      {jobs ? (
        <Accordion onChange={setAccordionIndex} index={accordionIndex} allowToggle>
          {jobs.map((job, i) => (
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
