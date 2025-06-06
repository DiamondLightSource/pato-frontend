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
  Button,
  Link,
  Text,
} from "@chakra-ui/react";
import { useCallback, useEffect, useMemo } from "react";
import {
  Link as RouterLink,
  useLoaderData,
  useNavigate,
  useParams,
  useRevalidator,
} from "react-router";
import {
  Pagination,
  DebouncedInput,
  Table,
  TwoLineLink,
  baseToast,
} from "@diamondlightsource/ui-components";
import { handleGroupClicked, SessionDataResponse } from "loaders/session";
import { groupsHeaders } from "utils/config/table";
import { usePaginationSearchParams } from "utils/hooks";
import { Form } from "components/form/form";
import { FormItem, Options } from "components/form/input";
import { useForm } from "react-hook-form";
import { emailRegex, required } from "utils/validation";
import { client, prependApiUrl } from "utils/api/client";
import { useQueryClient } from "@tanstack/react-query";
import { UserWithEmail } from "loaders/user";
import { getErrorMessage } from "utils/generic";

export interface EmailFormProps extends Omit<ModalProps, "children"> {
  user: UserWithEmail | null;
}

interface EmailFormValues {
  emailAddress: string;
}

const fileExtensionValues = [
  { key: ".tif", value: ".tif" },
  { key: ".tiff", value: ".tiff" },
  { key: ".mrc", value: ".mrc" },
  { key: ".eer", value: ".eer" },
];

export const DataCollectionCreationForm = (props: Omit<ModalProps, "children">) => {
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
      toast({
        ...baseToast,
        title: "Error creating data collection",
        description: getErrorMessage(response),
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
        <ModalBody p='1em'>
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

export const EmailForm = ({ user, ...props }: EmailFormProps) => {
  const { handleSubmit, register, formState } = useForm<EmailFormValues>();
  const toast = useToast();

  const onSubmit = handleSubmit(async (formData) => {
    const response = await client.patch("me", formData);

    if (response.status !== 200) {
      toast({
        ...baseToast,
        title: "Error updating alert email",
        description: getErrorMessage(response),
        status: "error",
      });
    } else {
      toast({
        ...baseToast,
        title: "Successfully updated alert email!",
      });

      props.onClose();
    }
  });

  return (
    <Modal size='2xl' {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          <Heading size='md'>Set your contact email</Heading>
          <ModalCloseButton />
        </ModalHeader>
        <Divider />
        <ModalBody p='1em'>
          <Text size='sm' mb='1em'>
            Set your preferred email to be used for alerts
          </Text>
          <Form onSubmit={onSubmit} onClose={props.onClose}>
            <FormItem label='Email' error={formState.errors.emailAddress}>
              <Input
                borderColor={formState.errors.emailAddress && "red"}
                size='sm'
                defaultValue={user?.email}
                {...register("emailAddress", {
                  required,
                  pattern: { value: emailRegex, message: "Invalid email address" },
                })}
              />
            </FormItem>
          </Form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export const SessionPage = () => {
  const data = useLoaderData() as SessionDataResponse;

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isEmailOpen, onOpen: onEmailOpen, onClose: onEmailClose } = useDisclosure();
  const { page, setPage, setItemsPerPage, onSearch } = usePaginationSearchParams();
  const { propId, visitId } = useParams();

  const navigate = useNavigate();

  const handleRowClicked = useCallback(
    (item: Record<string, any>) => {
      navigate(handleGroupClicked(item), { relative: "path" });
    },
    [navigate]
  );

  const tableData = useMemo(() => {
    if (data.items === null) {
      return null;
    }

    // FIXME: tomograms currently have entries in the Atlas table, but they have no actual atlas data.
    // Once this is fixed in the pipeline, we can remove the experiment type check.
    return data.items.map((row) => ({
      ...row,
      atlasLink:
        row.atlasId && row.experimentTypeName === "Single Particle" ? (
          <Button
            size='xs'
            as={RouterLink}
            to={`groups/${row.dataCollectionGroupId}/atlas`}
            relative='path'
          >
            View Atlas
          </Button>
        ) : null,
    }));
  }, [data]);

  useEffect(() => {
    document.title = "PATo » Session";
  }, []);

  if (data.session === null) {
    return (
      <VStack>
        <Heading pt={5} variant='notFound'>
          Session Not Found
        </Heading>
        <Heading w='50%' pb={5} variant='notFoundSubtitle'>
          ...or you may not have permission to view this session. If this was shared with you
          through a link, check with the person that sent it.
        </Heading>
        <Link color='diamond.700' href='..' as={RouterLink} to='..'>
          Go back
        </Link>
      </VStack>
    );
  }

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
            <StatLabel>Microscope</StatLabel>
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
              data={tableData}
              headers={groupsHeaders}
              label='data collection groups'
              onClick={handleRowClicked}
            />
            <Divider />
            {data.items !== null && (
              <Pagination
                limit={data.limit}
                page={page}
                onPageChange={setPage}
                onItemCountChange={setItemsPerPage}
                total={data.total}
                w='100%'
              />
            )}
          </VStack>
          <VStack alignItems='start'>
            <Heading size='lg'>Actions</Heading>
            <Divider />
            {/** @ts-expect-error */}
            <TwoLineLink title='Upload Particle Picking Model' as={RouterLink} to='upload-model'>
              Upload custom model for particle picking (crYOLO)
            </TwoLineLink>
            <TwoLineLink
              title='Submit Feedback'
              href={window.ENV.FEEDBACK_URL}
              isDisabled={!window.ENV.FEEDBACK_URL}
            >
              Submit session feedback
            </TwoLineLink>
            <TwoLineLink title='Create New Data Collection' onClick={onOpen}>
              Create new data collection in session
            </TwoLineLink>
            <TwoLineLink
              title='Edit sample information'
              href={prependApiUrl(`proposals/${propId}/sessions/${visitId}/sampleHandling`)}
            >
              Edit session's sample information
            </TwoLineLink>
            <TwoLineLink title='Set your contact email' onClick={onEmailOpen}>
              Set your preferred email to be used for alerts
            </TwoLineLink>
          </VStack>
        </HStack>
      </VStack>
      <DataCollectionCreationForm onClose={onClose} isOpen={isOpen} />
      <EmailForm user={data.user} onClose={onEmailClose} isOpen={isEmailOpen} />
    </Box>
  );
};
