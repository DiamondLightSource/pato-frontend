import {
  Spacer,
  VStack,
  Text,
  Tag,
  AccordionButton,
  HStack,
  AccordionIcon,
  Stack,
  useDisclosure,
  IconButton,
  Tooltip,
} from "@chakra-ui/react";
import { FaSlidersH } from "react-icons/fa";
import { components } from "schema/main";
import { recipeTagMap } from "utils/config/parse";
import { parseDate } from "utils/generic";
import { JobParamsDrawer } from "./jobParams";

export interface TwoLineTitleProps {
  title: string;
  value: string | number;
}

export interface ProcTitleProps {
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
  <VStack spacing='0'>
    <Text w='100%'>
      <b>{title}</b>
    </Text>
    <Text w='100%' marginTop='0' fontSize={14}>
      {value}
    </Text>
  </VStack>
);

const RecipeTag = ({ recipe }: { recipe: string }) => {
  if (!(recipe in recipeTagMap)) {
    return null;
  }

  return <Tag colorScheme='blue'>{recipeTagMap[recipe]}</Tag>;
};

const ProcessingTitle = ({ procJob, autoProc, status }: ProcTitleProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      borderTop='solid 4px'
      borderColor='diamond.200'
      py={1.5}
      px={3}
      w='100%'
      bg='diamond.100'
    >
      <HStack gap={{ base: 0, xl: "5vw" }}>
        <TwoLineTitle title='Processing Job' value={procJob.processingJobId} />
        <TwoLineTitle title='AutoProc. Program' value={autoProc.autoProcProgramId} />
        <TwoLineTitle
          title='Processing Start'
          value={parseDate(autoProc.processingStartTime ?? "?")}
        />
        <TwoLineTitle title='Processing End' value={parseDate(autoProc.processingEndTime ?? "?")} />
      </HStack>
      <Spacer />
      <HStack>
        <RecipeTag recipe={procJob.recipe} />
        <Tag colorScheme={jobStatusColour[status]}>{status}</Tag>
        <Tooltip label='View Job Parameters'>
          <IconButton
            icon={<FaSlidersH />}
            ml='10px'
            size='sm'
            onClick={onOpen}
            aria-label='View Job Parameters'
          />
        </Tooltip>
        <Spacer />
        <AccordionButton aria-label='Show Content' width='auto'>
          <AccordionIcon />
        </AccordionButton>
      </HStack>
      {isOpen && <JobParamsDrawer procJobId={procJob.processingJobId} onClose={onClose} />}
    </Stack>
  );
};

export { TwoLineTitle, ProcessingTitle };
