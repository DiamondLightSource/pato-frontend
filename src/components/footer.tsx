import { Box, Link, Text } from "@chakra-ui/react";
import { FunctionComponent } from "react";

const Footer: FunctionComponent = (): JSX.Element => (
  <Box bg='diamond.800' color='gray.200' py={2} className='footer'>
    <Text textAlign='center'>
      eBIC v{process.env.REACT_APP_VERSION} | © 2022 <Link href='https://diamond.ac.uk'>Diamond Light Source </Link>
    </Text>
  </Box>
);

export default Footer;
