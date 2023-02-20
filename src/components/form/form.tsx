import { Divider, Box, Button, HStack, Spacer } from "@chakra-ui/react";
import { FormEvent, ReactNode, useCallback } from "react";

interface FormProps {
  children?: ReactNode;
  onSubmit?: (data: Record<string, any>) => void;
  onClose?: () => void;
}

const Form = ({ onSubmit, children, onClose = () => {} }: FormProps) => {
  const handleSubmit = useCallback(
    (form: FormEvent<HTMLFormElement>) => {
      form.preventDefault();
      const formData = (form.target as HTMLFormElement).elements as HTMLFormControlsCollection;
      let parsedData: Record<string, any> = {};

      for (let i = 0; i < formData.length; i++) {
        const element = formData[i] as HTMLInputElement;
        if (element.name) {
          parsedData[element.name] = element.value;
        }
      }

      if (Object.keys(parsedData).length > 0 && onSubmit) {
        onSubmit(parsedData);
      }
    },
    [onSubmit]
  );

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Box p={3} bg='diamond.75'>
          {children}
        </Box>
        <Divider />
        <HStack px={4} py={2} spacing={3}>
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
