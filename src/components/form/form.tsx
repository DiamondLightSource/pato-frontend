import { Divider, Box, Button, HStack, Spacer, BoxProps } from "@chakra-ui/react";
import { ReactNode } from "react";

export interface FormProps extends BoxProps {
  children?: ReactNode;
  onClose?: () => void;
}

const Form = (props: FormProps) => {
  const { children, onClose } = props;

  return (
    <Box {...props}>
      <form>
        <Box py={2}>{children}</Box>
        <Divider />
        <HStack py={2} spacing={3}>
          <Spacer />
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button type='submit'>Submit</Button>
        </HStack>
      </form>
    </Box>
  );
};

export { Form };
