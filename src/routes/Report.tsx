import {
  Divider,
  Heading,
  HStack,
  Text,
  Box,
  Input,
  VStack,
  Textarea,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import { Form } from "components/form/form";
import { FormItem } from "components/form/input";
import { useCallback } from "react";

const FeedbackForm = () => {
  const handleSubmit = useCallback((info: Record<string, any>) => {
    const data = {...info, userAgent: navigator.userAgent};
    console.log(data);
  }, []);
  return (
    <Box h='100%'>
      <Heading>Report Feedback</Heading>
      <Divider mb={4} />
      <HStack spacing={16} alignItems='start' flexWrap='wrap'>
        <Form onSubmit={handleSubmit} p='0' flexGrow='1' flexBasis='300px'>
          <VStack gap={6}>
            <FormItem label='Full Name' unit="required" >
              <Input name='fullName' variant='hi-contrast' />
            </FormItem>
            <FormItem label='Email' unit="required" helperText='Address used for responses'>
              <Input name='email' variant='hi-contrast' />
            </FormItem>
            <FormItem label='Comments' helperText='General comments, such as issue details and suggestions'>
              <Textarea name='comments' variant='hi-contrast' />
            </FormItem>
          </VStack>
        </Form>
        <VStack
          flexBasis='min-content'
          flexGrow='1'
          borderLeft='4px solid var(--chakra-colors-diamond-800)'
          paddingLeft='1em'
          alignItems='start'
        >
          <Heading size='lg'>Data Privacy</Heading>
          <Text minW='200px'>Alongside the information provided in the form, the following details are included:</Text>
          <UnorderedList>
            <ListItem>Operating System</ListItem>
            <ListItem>Browser</ListItem>
          </UnorderedList>
        </VStack>
      </HStack>
    </Box>
  );
};

export default FeedbackForm;
