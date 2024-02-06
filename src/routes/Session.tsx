import { Divider, Heading, HStack, Spacer, Box, VStack, Stat, StatLabel, StatNumber, Modal, ModalBody, ModalCloseButton, ModalContent, ModalHeader, ModalOverlay, useDisclosure, Input, Select } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import { Pagination, DebouncedInput, Table, TwoLineLink } from "@diamondlightsource/ui-components";
import { ParsedSessionReponse } from "schema/interfaces";
import { handleGroupClicked } from "loaders/session";
import { groupsHeaders } from "utils/config/table";
import { usePaginationSearchParams } from "utils/hooks";
import { Form } from "components/form/form";
import { FormItem, Options } from "components/form/input";
import { useForm } from "react-hook-form";
import { required } from "utils/validation";

interface LoaderData {
  items: Record<string, any>[];
  session: ParsedSessionReponse;
  total: number;
  limit: number;
}

const fileExtensionValues = [
  { key: ".tif", value: ".tif" },
  { key: ".tiff", value: ".tiff" },
  { key: ".mrc", value: ".mrc"},
  { key: ".eer", value: ".eer" },
];

const SessionPage = () => {
  const data = useLoaderData() as LoaderData;
  const { isOpen, onOpen, onClose } = useDisclosure();

  const { page, setPage, setItemsPerPage, onSearch } = usePaginationSearchParams();


  const {
    handleSubmit,
    register,
  } = useForm();

  const navigate = useNavigate();

  const handleRowClicked = useCallback(
    (item: Record<string, any>) => {
      navigate(handleGroupClicked(item), { relative: "path" });
    },
    [navigate]
  );

  const onSubmit = handleSubmit((formData) => {
    console.log(formData)
  })

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
        <HStack w="100%" gap="1em" alignItems="start" flexWrap="wrap">
          <VStack flex="1 0 700px">
            <HStack w='100%' >
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
            <TwoLineLink title='Create New Data Collection' onClick={onOpen}>Create new data collection in session</TwoLineLink>
          </VStack>
        </HStack>
      </VStack>
      <Modal size='2xl' isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              <Heading size='md'>Create New Data Collection</Heading>
              <ModalCloseButton />
            </ModalHeader>
            <Divider />
            <ModalBody p={0}>
              <Form onSubmit={onSubmit}>
              <FormItem label="Movie File Directory">
                <Input size='sm' defaultValue='raw' {...register("fileDirectory", {required})} />
              </FormItem>
              <FormItem label='Movie File Name Extension'>
                <Select size='sm' defaultValue=".tif" {...register("fileNameExtension")}>
                  <Options values={fileExtensionValues} />
                </Select>
              </FormItem>
              </Form>
            </ModalBody>
          </ModalContent>
        </Modal>
    </Box>
  );
};

export { SessionPage };
