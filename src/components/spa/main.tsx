import {
  AccordionButton,
  Text,
  VStack,
  Spacer,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Button,
  Grid,
  GridItem,
  HStack,
  Icon,
  Tag,
  Tooltip,
} from "@chakra-ui/react";
import { Motion } from "../motion/motion";
import { useCallback, useState } from "react";
import { Class2d } from "./class2d";
import { ParticlePicking } from "./particlePicking";
import { CTF } from "../ctf/ctf";
import { components } from "../../schema/main";
import { MdRedo } from "react-icons/md";

type AutoProcSchema = components["schemas"]["AutoProcProgram"];
type ProcessingJobSchema = components["schemas"]["ProcessingJob"];

interface SpaProps {
  /* Parent autoprocessing program ID*/
  autoProc: AutoProcSchema;
  procJob: ProcessingJobSchema;
  status: string;
  onReprocessingClicked?: (procJobId: number) => void;
  active: boolean;
}

interface ProcTitleInfoProps {
  title: string;
  value: string | number;
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

const jobStatusColour: Record<string, string> = {
  Success: "green",
  Queued: "purple",
  Fail: "red",
  Running: "orange",
};

const SPA = ({ autoProc, procJob, status, onReprocessingClicked, active }: SpaProps) => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number | undefined>();

  const handlePageChanged = useCallback((_: any, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleGraphClicked = useCallback((x: number) => {
    setPage(x);
  }, []);

  const handleProcessingClicked = useCallback(() => {
    if (onReprocessingClicked) {
      onReprocessingClicked(procJob.processingJobId);
    }
  }, [onReprocessingClicked, procJob]);

  return (
    <AccordionItem>
      <h2>
        <HStack py={1.5} px={3} w='100%' bg='diamond.100'>
          <ProcTitleInfo title='Processing Job' value={procJob.processingJobId} />
          <ProcTitleInfo title='AutoProc. Program' value={autoProc.autoProcProgramId} />
          <ProcTitleInfo title='Processing Start' value={autoProc.processingStartTime ?? "?"} />
          <ProcTitleInfo title='Processing End' value={autoProc.processingEndTime ?? "?"} />
          <Tag colorScheme={jobStatusColour[status]}>{status}</Tag>
          <Tooltip label='Run Reprocessing'>
            <Button isDisabled onClick={handleProcessingClicked}>
              <Icon as={MdRedo} />
            </Button>
          </Tooltip>
          <AccordionButton width='auto'>
            <AccordionIcon />
          </AccordionButton>
        </HStack>
      </h2>
      <AccordionPanel p={0}>
        {active && (
          <Grid gap={3} bg='diamond.75' p={4}>
            <GridItem>
              <CTF onGraphClicked={handleGraphClicked} parentId={autoProc.autoProcProgramId} parentType='autoProc' />
            </GridItem>
            <Motion
              currentPage={page}
              onMotionChanged={handlePageChanged}
              onTotalChanged={setTotal}
              parentType='autoProc'
              parentId={autoProc.autoProcProgramId}
            />
            <ParticlePicking autoProcId={autoProc.autoProcProgramId} currentPage={page} total={total} />
            <Class2d autoProcId={autoProc.autoProcProgramId} />
          </Grid>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export { SPA };
