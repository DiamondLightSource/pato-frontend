import {
  Divider,
  Heading,
  HStack,
  Spacer,
  Box,
  VStack,
  Stat,
  StatLabel,
  StatNumber,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Input,
  Select,
  useToast,
  ModalProps,
} from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { useLoaderData, useNavigate, useParams, useRevalidator } from "react-router-dom";
import {
  Pagination,
  DebouncedInput,
  Table,
  TwoLineLink,
  baseToast,
} from "@diamondlightsource/ui-components";
import { ParsedSessionReponse } from "schema/interfaces";
import { handleGroupClicked } from "loaders/session";
import { groupsHeaders } from "utils/config/table";
import { usePaginationSearchParams } from "utils/hooks";
import { Form } from "components/form/form";
import { FormItem, Options } from "components/form/input";
import { useForm } from "react-hook-form";
import { required } from "utils/validation";
import { client } from "utils/api/client";
import { useQueryClient } from "@tanstack/react-query";

interface LoaderData {
  items: Record<string, any>[];
  session: ParsedSessionReponse;
  total: number;
  limit: number;
}

const fileExtensionValues = [
  { key: ".tif", value: ".tif" },
  { key: ".tiff", value: ".tiff" },
  { key: ".mrc", value: ".mrc" },
  { key: ".eer", value: ".eer" },
];

const DataCollectionCreationForm = (props: Omit<ModalProps, "children">) => {
  const queryClient = useQueryClient();
  const { handleSubmit, register } = useForm();
  const revalidator = useRevalidator();
  const toast = useToast();
  const { propId, visitId } = useParams();

  const onSubmit = handleSubmit(async (formData) => {
    const response = await client.post(
      `proposals/${propId}/sessions/${visitId}/dataCollections`,
      formData
    );

    if (response.status !== 201) {
      const message =
        response.status !== 500
          ? response.data
          : "Report this error to a local contact or developer";
      toast({
        ...baseToast,
        title: "Error creating data collection",
        description: message.detail,
        status: "error",
      });
    } else {
      toast({
        ...baseToast,
        title: "Successfully created data collection!",
      });

      // An alternative way would be to do this in a Router action, and although it works, there is no real benefit,
      // and we lose access to the component's context
      queryClient.removeQueries({ queryKey: ["dataGroups"] });
      revalidator.revalidate();
      props.onClose();
    }
  });

  return (
    <Modal size='2xl' {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size='md'>Create New Data Collection</Heading>
          <ModalCloseButton />
        </ModalHeader>
        <Divider />
        <ModalBody p={0}>
          <Form onSubmit={onSubmit} onClose={props.onClose}>
            <FormItem label='Movie File Directory'>
              <Input size='sm' defaultValue='raw' {...register("fileDirectory", { required })} />
            </FormItem>
            <FormItem label='Movie File Name Extension'>
              <Select size='sm' defaultValue='.tif' {...register("fileExtension")}>
                <Options values={fileExtensionValues} />
              </Select>
            </FormItem>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

const SessionPage = () => {
  const data = useLoaderData() as LoaderData;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { page, setPage, setItemsPerPage, onSearch } = usePaginationSearchParams();
  const { propId, visitId } = useParams();

  const navigate = useNavigate();

  const handleRowClicked = useCallback(
    (item: Record<string, any>) => {
      navigate(handleGroupClicked(item), { relative: "path" });
    },
    [navigate]
  );

  useEffect(() => {
    document.title = "PATo » Session";
  }, []);

  return (
    <Box h='100%'>
      <Heading>Session</Heading>
      <Divider mb={4} />
      <VStack alignItems='start'>
        <HStack mb='2em' w='100%'>
          <Stat borderBottom='3px solid' borderColor='diamond.700'>
            <StatLabel>Start Date</StatLabel>
            <StatNumber>{data.session.startDate}</StatNumber>
          </Stat>
          <Stat borderBottom='3px solid' borderColor='diamond.700'>
            <StatLabel>End Date</StatLabel>
            <StatNumber>{data.session.endDate}</StatNumber>
          </Stat>
          <Stat borderBottom='3px solid' borderColor='diamond.700'>
            <StatLabel>Beamline</StatLabel>
            <StatNumber>{data.session.microscopeName}</StatNumber>
          </Stat>
        </HStack>
        <HStack w='100%' gap='1em' alignItems='start' flexWrap='wrap'>
          <VStack flex='1 0 700px'>
            <HStack w='100%'>
              <Heading size='lg'>Data Collection Groups</Heading>
              <Spacer />
              <DebouncedInput
                onChangeEnd={onSearch}
                borderColor='gray.600'
                bg='diamond.50'
                w={{ base: "auto", md: "40%" }}
                size='sm'
                placeholder='Search...'
              />
            </HStack>
            <Divider mb={4} />
            <Table
              w='100%'
              data={data.items}
              headers={groupsHeaders}
              label='data collection groups'
              onClick={handleRowClicked}
            />
            <Divider />
            <Pagination
              limit={data.limit}
              page={page}
              onPageChange={setPage}
              onItemCountChange={setItemsPerPage}
              total={data.total}
              w='100%'
            />
          </VStack>
          <VStack alignItems='start'>
            <Heading size='lg'>Actions</Heading>
            <Divider />
            <TwoLineLink title='Upload Model' isDisabled={true}>
              Upload custom model for data processing
            </TwoLineLink>
            <TwoLineLink title='Submit Feedback' href='/feedback' isDisabled={true}>
              Submit session feedback
            </TwoLineLink>
            <TwoLineLink title='Create New Data Collection' onClick={onOpen}>
              Create new data collection in session
            </TwoLineLink>
            <TwoLineLink
              title='Edit sample information'
              isDisabled={!process.env.REACT_APP_SAMPLE_HANDLING}
              href={`${process.env.REACT_APP_SAMPLE_HANDLING}/proposals/${propId}/sessions/${visitId}`}
            >
              Edit session's sample information
            </TwoLineLink>
          </VStack>
        </HStack>
      </VStack>
      <DataCollectionCreationForm onClose={onClose} isOpen={isOpen} />
    </Box>
  );
};

export { SessionPage, DataCollectionCreationForm };
