import { Box, Link, Text } from "@chakra-ui/react";

const Footer = () => (
  <Box bg='diamond.800' color='gray.200' py={2} className='footer'>
    <Text textAlign='center'>
      PATo{" "}
      <Link color='diamond.400' href='https://github.com/DiamondLightSource/pato-frontend/'>
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
