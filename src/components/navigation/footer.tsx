import { Spacer, HStack, Link, Text } from "@chakra-ui/react";
import { Link as LinkRouter } from "react-router-dom";

const Footer = () => (
  <HStack px={{ base: 4, md: "7.5vw" }} bg='diamond.800' color='gray.200' py={2} className='footer'>
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
    <Spacer />
    {process.env.REACT_APP_ENABLE_FEEDBACK === "true" && (
      <Link as={LinkRouter} to='/feedback' color='diamond.400'>
        Feedback
      </Link>
    )}
  </HStack>
);

export { Footer };
