import { Box, Text } from "@chakra-ui/react";
import { FunctionComponent } from "react";

const Footer: FunctionComponent = (): JSX.Element => {
  return (
    <Box bg='diamond.800' color='gray.200' py={2} className='footer'>
      <Text textAlign='center'>eBIC v1.0.0 | © 2022 Diamond Light Source</Text>
    </Box>
  );
};

export default Footer;
