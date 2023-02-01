import { Box, Link, Text } from "@chakra-ui/react";

const Footer = () => (
  <Box bg='diamond.800' color='gray.200' py={2} className='footer'>
    <Text textAlign='center'>
      eBIC{" "}
      <Link color='diamond.400' href='https://gitlab.diamond.ac.uk/lims/ebic-frontend'>
        {process.env.REACT_APP_VERSION}
      </Link>{" "}
      | © 2023{" "}
      <Link color='diamond.400' href='https://diamond.ac.uk'>
        Diamond Light Source{" "}
      </Link>
    </Text>
  </Box>
);

export { Footer };
