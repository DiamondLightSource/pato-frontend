import { Divider, Box, Button, HStack, Spacer, BoxProps } from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";

export interface FormProps extends Omit<BoxProps, "onSubmit"> {
  children?: ReactNode;
  onClose?: () => void;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
}

const Form = ({ children, onClose, onSubmit, ...props }: FormProps) => {
  const handleSubmit = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(e);
      }
    },
    [onSubmit]
  );
  return (
    <Box {...props}>
      <form onSubmit={handleSubmit}>
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
