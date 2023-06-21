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

const FeedbackForm = () => {
  return (
    <Box h='100%'>
      <Heading>Report Issue</Heading>
      <Divider mb={4} />
      <HStack>
        <Form p='0' w='50%'>
          <VStack gap={6}>
            <FormItem label='Full Name'>
              <Input variant='hi-contrast' />
            </FormItem>
            <FormItem label='Email' helperText='Address used for responses'>
              <Input variant='hi-contrast' />
            </FormItem>
            <FormItem label='Comments' helperText='Issue details, '>
              <Textarea variant='hi-contrast' />
            </FormItem>
          </VStack>
        </Form>
        <VStack paddingLeft='2em' w='50%' alignItems='start'>
          <Heading size='lg'>What can we see?</Heading>
          <Text>All information is used for issue tracing purposes</Text>
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
