import { Spacer, HStack, Link, Text } from "@chakra-ui/react";
import { Link as LinkRouter } from "react-router-dom";

const currentYear = new Date().getFullYear();

const Footer = () => (
  <HStack
    px={{ base: 4, md: "7.5vw" }}
    bg='diamond.800'
    color='gray.200'
    py={2}
    className='footer'
    flexWrap='wrap'
  >
    <Text textAlign='center'>
      PATo{" "}
      <Link color='diamond.400' href='https://github.com/DiamondLightSource/pato-frontend/'>
        {process.env.REACT_APP_VERSION}
      </Link>{" "}
      | © {currentYear}
      <Link color='diamond.400' href='https://diamond.ac.uk'>
        {" "}
        Diamond Light Source{" "}
      </Link>
    </Text>
    <Spacer />
    <HStack gap='2em' minWidth='200px'>
      <Link as={LinkRouter} to='/about' color='diamond.400'>
        About Processing
      </Link>
      {process.env.REACT_APP_ENABLE_FEEDBACK === "true" && (
        <Link as={LinkRouter} to='/feedback' color='diamond.400'>
          Feedback
        </Link>
      )}
    </HStack>
  </HStack>
);

export { Footer };
