import {
  Text,
  Heading,
  Box,
  VStack,
  Code,
  HStack,
  Button,
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionButton,
  Spacer,
  AccordionIcon,
  Divider,
  Icon,
  Skeleton,
  Grid,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { client } from "../utils/api/client";
import { useAppDispatch } from "../store/hooks";
import { setLoading } from "../features/uiSlice";
import { parseData } from "../utils/generic";
import { CollectionData } from "../utils/interfaces";
import { components } from "../schema/main";
import { buildEndpoint } from "../utils/api/endpoint";
import SPA from "../components/spa/main";
import { collectionConfig } from "../utils/parseConfig";
import { MdSettings } from "react-icons/md";

type ProcessingJob = components["schemas"]["ProcessingJobOut"];

const SPAPage = () => {
  const params = useParams();
  const [collectionData, setCollectionData] = useState<CollectionData>({ info: [], comments: "" });
  const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const updateCollection = useCallback(
    (page: number) => {
      navigate(`../${page}`, { relative: "path" });
    },
    [navigate]
  );

  useEffect(() => {
    document.title = `eBIC » SPA » ${params.groupId}`;
    dispatch(setLoading(true));
    client.safe_get(buildEndpoint("dataCollections", params, 1, 1)).then((response) => {
      setCollectionData(parseData(response.data.items[0], collectionConfig) as CollectionData);
    });
  }, [params, dispatch, navigate, updateCollection]);

  useEffect(() => {
    const collectionId = collectionData.dataCollectionId;
    if (collectionId !== undefined) {
      client
        .safe_get(buildEndpoint("processingJobs", { collectionId: collectionId.toString() }, 25, 1))
        .then((response) => {
          setProcessingJobs(response.data.items);
        });
    }
  }, [collectionData, params]);

  return (
    <Box>
      <HStack marginBottom={2}>
        <VStack>
          <HStack w='100%'>
            <Heading>Data Collection</Heading>
          </HStack>
          <Heading color='diamond.300' size='sm'>
            Proposal <Code>{params.propId}</Code>, visit <Code>{params.visitId}</Code>, data collection group{" "}
            <Code>{params.groupId}</Code>, data collection <Code>{collectionData.dataCollectionId}</Code>
          </Heading>
        </VStack>
      </HStack>
      <Divider marginY={2} />
      <Accordion defaultIndex={[0]} allowToggle>
        {processingJobs.length ? (
          processingJobs.map((job, i) => (
            <AccordionItem key={i}>
              <h2>
                <HStack py={1.5} px={3} w='100%' bg='diamond.100'>
                  <Text size='md'>
                    <b>Processing Job:</b> {job.ProcessingJob.processingJobId}
                  </Text>
                  <Text size='md' px={7}>
                    <b>AutoProc. Program:</b> {job.AutoProcProgram.autoProcProgramId}
                  </Text>
                  <Text size='md' px={7}>
                    <b>Processing Start:</b> {job.AutoProcProgram.processingStartTime}
                  </Text>
                  <Text size='md' px={7}>
                    <b>Processing End:</b> {job.AutoProcProgram.processingEndTime}
                  </Text>
                  <Spacer />
                  <Button disabled>
                    <Icon as={MdSettings} />
                  </Button>
                  <AccordionButton width='auto'>
                    <AccordionIcon />
                  </AccordionButton>
                </HStack>
              </h2>
              <AccordionPanel p={0}>
                <SPA
                  autoProcId={job.AutoProcProgram.autoProcProgramId}
                  processingJobId={job.ProcessingJob.processingJobId}
                />
              </AccordionPanel>
            </AccordionItem>
          ))
        ) : (
          <Grid gap={3}>
            <Skeleton h='4vh' />
            <Skeleton h='25vh' />
            <Skeleton h='25vh' />
            <Skeleton h='20vh' />
          </Grid>
        )}
      </Accordion>
    </Box>
  );
};

export default SPAPage;
