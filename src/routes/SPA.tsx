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
  Tag,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { client } from "../utils/api/client";
import { useAppDispatch } from "../store/hooks";
import { setLoading } from "../features/uiSlice";
import { parseData } from "../utils/generic";
import { CollectionData, DataConfig } from "../utils/interfaces";
import { components } from "../schema/main";
import { buildEndpoint } from "../utils/api/endpoint";
import SPA from "../components/spa/main";
import { collectionConfig } from "../utils/config/parse";
import { MdFolder, MdPlayArrow } from "react-icons/md";
import InfoGroup from "../components/infogroup";

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

interface ProcTitleInfoProps {
  title: string;
  value: string | number;
}

interface SpaCollectionData extends CollectionData {
  fileTemplate: string;
  imageDirectory: string;
}

const ProcTitleInfo = ({ title, value }: ProcTitleInfoProps) => (
  <>
    <VStack spacing='0'>
      <Text w='100%'>
        <b>{title}</b>
      </Text>
      <Text w='100%' marginTop='0' fontSize={14}>
        {value}
      </Text>
    </VStack>
    <Spacer />
  </>
);

const SPAPage = () => {
  const params = useParams();
  const [collectionData, setCollectionData] = useState<SpaCollectionData>({
    info: [],
    comments: "",
    fileTemplate: "",
    imageDirectory: "",
  });
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
      const data = response.data.items[0] as DataCollection;
      const parsedData = parseData(data, spaCollectionConfig) as SpaCollectionData;

      parsedData.info.unshift({ label: "Acquisition Software", value: getAcquisitionSoftware(data.fileTemplate) });
      parsedData.info.push({ label: "Comments", value: getAcquisitionSoftware(data.comments ?? ""), wide: true });
      setCollectionData(parsedData);
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
        <VStack w='100%'>
          <HStack w='100%'>
            <Heading>Data Collection</Heading>
            <Tag colorScheme='orange'>SPA</Tag>
            <Spacer />
            <Button disabled>
              <Icon as={MdPlayArrow} />
            </Button>
          </HStack>
          <HStack w='100%'>
            <Heading color='diamond.300' size='sm'>
              Proposal <Code>{params.propId}</Code>, visit <Code>{params.visitId}</Code>, data collection group{" "}
              <Code>{params.groupId}</Code>, data collection <Code>{collectionData.dataCollectionId}</Code>
            </Heading>
            <Spacer />
            <Tag bg='diamond.200'>
              <Icon as={MdFolder} />
              <Text px={3} fontSize={12}>{`${collectionData.imageDirectory}${collectionData.fileTemplate}`}</Text>
            </Tag>
          </HStack>
        </VStack>
      </HStack>
      <Divider marginY={2} />
      <InfoGroup cols={5} info={collectionData.info} />
      <Divider marginY={2} />
      <Accordion defaultIndex={[0]} allowToggle>
        {processingJobs.length ? (
          processingJobs.map((job, i) => (
            <AccordionItem key={i}>
              <h2>
                <HStack py={1.5} px={3} w='100%' bg='diamond.100'>
                  <ProcTitleInfo title='Processing Job' value={job.ProcessingJob.processingJobId} />
                  <ProcTitleInfo title='AutoProc. Program' value={job.AutoProcProgram.autoProcProgramId} />
                  <ProcTitleInfo title='Processing Start' value={job.AutoProcProgram.processingStartTime ?? "?"} />
                  <ProcTitleInfo title='Processing End' value={job.AutoProcProgram.processingEndTime ?? "?"} />
                  <Tag colorScheme={job.AutoProcProgram.processingStatus === 1 ? "green" : "red"}>
                    {job.AutoProcProgram.processingStatus === 1 ? "Success" : "Fail"}
                  </Tag>
                  <AccordionButton width='auto'>
                    <AccordionIcon />
                  </AccordionButton>
                </HStack>
              </h2>
              <AccordionPanel p={0}>
                <SPA autoProcId={job.AutoProcProgram.autoProcProgramId} />
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
