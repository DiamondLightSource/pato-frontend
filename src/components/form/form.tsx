import { Divider, Box, Button, HStack, Spacer } from "@chakra-ui/react";
import { FormEvent, ReactNode, useCallback } from "react";

interface FormProps {
  children?: ReactNode;
  onSubmit?: (data: Record<string, any>) => void;
}

const Form = ({ onSubmit, children }: FormProps) => {
  const handleSubmit = useCallback((form: FormEvent<HTMLFormElement>) => {
    form.preventDefault();
    const formData = (form.target as HTMLFormElement).elements as HTMLFormControlsCollection;
    let parsedData: Record<string,any> = {};

    for(let i = 0; i < formData.length; i++) {
      const element = formData[i] as HTMLInputElement;
      if (element.name) {
        parsedData[element.name ?? i.toString()] = element.value
      }
    }

    if (parsedData && onSubmit) {
      onSubmit(parsedData)
    }
  }, [onSubmit]);

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <Box p={3} bg='diamond.75'>
          {children}
        </Box>
        <Divider />
        <HStack px={4} py={2} spacing={3}>
          <Spacer />
          <Button variant='outline'>Cancel</Button>
          <Button type='submit'>Submit</Button>
        </HStack>
      </form>
    </Box>
  );
};

export default Form;
