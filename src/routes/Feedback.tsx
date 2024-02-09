import {
  Divider,
  Heading,
  HStack,
  Box,
  Input,
  VStack,
  Textarea,
  UnorderedList,
  ListItem,
  Text,
  createStandaloneToast,
  UseToastOptions,
} from "@chakra-ui/react";
import { Form } from "components/form/form";
import { FormItem } from "components/form/input";
import { useForm } from "react-hook-form";
import { baseToast } from "@diamondlightsource/ui-components";
import { client } from "utils/api/client";
import { required } from "utils/validation";

export interface FeedbackValues {
  fullName: string;
  email: string;
  comments?: string;
}

// This is not up to RFC822, but this doesn't need to be thorough
const emailRegex = /.+@.+\..+/g;
const errorToast: UseToastOptions = {
  ...baseToast,
  title: "An error has occurred while sending your feedback. Please try again later.",
  status: "error",
};

const FeedbackForm = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FeedbackValues>();
  const { toast } = createStandaloneToast();

  const onSubmit = handleSubmit((info) => {
    const data = { ...info };
    client
      .post("feedback", data)
      .then((response) => {
        if (response.status === 200) {
          toast({ ...baseToast, title: "Feedback successfully sent!" });
        } else {
          toast(errorToast);
        }
      })
      .catch(() => toast(errorToast));
  });

  return (
    <Box h='100%'>
      <Heading>Feedback</Heading>
      <Divider mb={4} />
      <HStack spacing={16} alignItems='start' flexWrap='wrap'>
        <Form onSubmit={onSubmit} p='0' flexGrow='1' flexBasis='300px'>
          <VStack gap={6}>
            <FormItem label='Full Name' unit='required' error={errors.fullName}>
              <Input
                borderColor={errors.fullName && "red"}
                {...register("fullName", { required })}
                variant='hi-contrast'
              />
            </FormItem>
            <FormItem
              label='Email'
              unit='required'
              helperText='Address used for responses'
              error={errors.email}
            >
              <Input
                borderColor={errors.email && "red"}
                {...register("email", {
                  required: "Field is required",
                  pattern: { value: emailRegex, message: "Invalid email address" },
                })}
                variant='hi-contrast'
              />
            </FormItem>
            <FormItem
              label='Comments'
              unit='required'
              helperText='General comments, such as issue details and suggestions'
              error={errors.comments}
            >
              <Textarea
                borderColor={errors.comments && "red"}
                {...register("comments", { required })}
                variant='hi-contrast'
              />
            </FormItem>
          </VStack>
        </Form>
        <VStack
          flexBasis='min-content'
          flexGrow='1'
          borderLeft='4px solid var(--chakra-colors-diamond-800)'
          paddingLeft='1em'
          alignItems='start'
          minW='200px'
        >
          <Heading size='lg'>Additional Data</Heading>
          <Text>
            Alongside the information provided in the form, the following details are included:
          </Text>
          <UnorderedList marginLeft='50px' my='10px'>
            <ListItem>Operating System</ListItem>
            <ListItem>Browser</ListItem>
          </UnorderedList>
          <Text>
            This data is used to track issues more effectively, and is not retained for extended
            periods of time.
          </Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default FeedbackForm;
