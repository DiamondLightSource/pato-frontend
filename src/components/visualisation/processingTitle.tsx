import { Spacer, VStack, Text, Tag, AccordionButton, HStack, AccordionIcon, Stack } from "@chakra-ui/react";
import { components } from "schema/main";
import { parseDate } from "utils/generic";

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
  <Stack
    direction={{ base: "column", md: "row" }}
    borderTop='solid 4px'
    borderColor='diamond.200'
    py={1.5}
    px={3}
    w='100%'
    bg='diamond.100'
  >
    <HStack flexGrow={1}>
      <TwoLineTitle title='Processing Job' value={procJob.processingJobId} />
      <TwoLineTitle title='AutoProc. Program' value={autoProc.autoProcProgramId} />
      <TwoLineTitle title='Processing Start' value={parseDate(autoProc.processingStartTime ?? "?")} />
      <TwoLineTitle title='Processing End' value={parseDate(autoProc.processingEndTime ?? "?")} />
    </HStack>
    <Spacer />
    <HStack>
      <Tag colorScheme={jobStatusColour[status]}>{status}</Tag>
      <Spacer />
      <AccordionButton width='auto'>
        <AccordionIcon />
      </AccordionButton>
    </HStack>
  </Stack>
);

export { TwoLineTitle, ProcessingTitle };
