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
} from "@chakra-ui/react";
import { Form } from "components/form/form";
import { FormItem } from "components/form/input";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

export interface FeedbackValues {
  fullName: string;
  email: string;
  comments?: string;
}

// This is not up to RFC822, but this doesn't need to be thorough 
const emailRegex = /.+@.+\..+/g

const FeedbackForm = () => {
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FeedbackValues>();

  useEffect(() => {
    console.log(errors);
  }, [errors]);

  const onSubmit = handleSubmit((info) => {
    const data = { ...info, userAgent: navigator.userAgent };
    console.log(data);
  });
  return (
    <Box h='100%'>
      <Heading>Feedback</Heading>
      <Divider mb={4} />
      <HStack spacing={16} alignItems='start' flexWrap='wrap'>
        <Form onSubmit={onSubmit} p='0' flexGrow='1' flexBasis='300px'>
          <VStack gap={6}>
            <FormItem label='Full Name' unit='required' error={errors.fullName && errors.fullName.message}>
              <Input
                borderColor={errors.fullName && "red"}
                {...register("fullName", { required: "Field is required" })}
                variant='hi-contrast'
              />
            </FormItem>
            <FormItem label='Email' unit='required' helperText='Address used for responses' error={errors.email && errors.email.message}>
              <Input
                borderColor={errors.email && "red"}
                {...register("email", { required: "Field is required", pattern: {value: emailRegex, message: "Invalid email address"} })}
                variant='hi-contrast'
              />
            </FormItem>
            <FormItem label='Comments' helperText='General comments, such as issue details and suggestions'>
              <Textarea borderColor={errors.comments && "red"} {...register("comments")} variant='hi-contrast' />
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
          <Text >Alongside the information provided in the form, the following details are included:</Text>
          <UnorderedList marginLeft="50px" my="10px">
            <ListItem>Operating System</ListItem>
            <ListItem>Browser</ListItem>
          </UnorderedList>
          <Text>This data is used to track issues more effectively, and is not retained for extended periods of time.</Text>
        </VStack>
      </HStack>
    </Box>
  );
};

export default FeedbackForm;
