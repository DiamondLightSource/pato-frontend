import { Divider, Box, Button, HStack, Spacer, BoxProps } from "@chakra-ui/react";
import { ReactNode, useCallback } from "react";

export interface FormProps extends Omit<BoxProps, "onSubmit"> {
  children?: ReactNode;
  onClose?: () => void;
  onSubmit?: React.FormEventHandler<HTMLFormElement>;
  isLoading?: boolean;
}

const Form = ({ children, onClose, onSubmit, isLoading, ...props }: FormProps) => {
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
        <Box p='0' bg='diamond.50'>
          {children}
        </Box>
        <Divider />
        <HStack py={2} spacing={3}>
          <Spacer />
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button isLoading={isLoading} type='submit'>Submit</Button>
        </HStack>
      </form>
    </Box>
  );
};

export { Form };
