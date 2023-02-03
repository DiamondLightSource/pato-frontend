import { Spacer, VStack, Text, Tag, AccordionButton, HStack, AccordionIcon } from "@chakra-ui/react";
import { components } from "../../schema/main";

interface TwoLineTitleProps {
  title: string;
  value: string | number;
}

interface ProcTitleProps {
  autoProc: components["schemas"]["AutoProcProgram"];
  procJob: components["schemas"]["ProcessingJob"];
  status: string;
}

const jobStatusColour: Record<string, string> = {
  Success: "green",
  Queued: "purple",
  Fail: "red",
  Running: "orange",
};

const TwoLineTitle = ({ title, value }: TwoLineTitleProps) => (
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

const ProcessingTitle = ({ procJob, autoProc, status }: ProcTitleProps) => (
  <HStack borderTop='solid 4px' borderColor='diamond.200' py={1.5} px={3} w='100%' bg='diamond.100'>
    <TwoLineTitle title='Processing Job' value={procJob.processingJobId} />
    <TwoLineTitle title='AutoProc. Program' value={autoProc.autoProcProgramId} />
    <TwoLineTitle title='Processing Start' value={autoProc.processingStartTime ?? "?"} />
    <TwoLineTitle title='Processing End' value={autoProc.processingEndTime ?? "?"} />
    <Tag colorScheme={jobStatusColour[status]}>{status}</Tag>
    <AccordionButton width='auto'>
      <AccordionIcon />
    </AccordionButton>
  </HStack>
);

export { TwoLineTitle, ProcessingTitle };
