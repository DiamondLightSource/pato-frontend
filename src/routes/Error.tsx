import { Heading, Link, VStack, Box, Text, Code } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useRouteError } from "react-router-dom";
import { Footer } from "components/navigation/footer";
import { Navbar } from "components/navigation/navbar";

interface ErrorType {
  status: number;
  statusText: string;
  data?: string;
}

const Error = () => {
  const [heading, setHeading] = useState("");
  const [message, setMessage] = useState("");
  const [details, setDetails] = useState("");
  const error = useRouteError() as ErrorType;

  useEffect(() => {
    console.error(error);
    if (error.status === 404) {
      setHeading("Page not found");
      setMessage("This page does not exist.");
    } else {
      setHeading("An error has occurred");
      setMessage(
        "An unexpected error has occurred. If this persists, please contact the developers. Details:"
      );
      setDetails(error.toString());
    }
  }, [error]);

  return (
    <div className='rootContainer'>
      <Navbar />
      <Box marginTop={12} className='main'>
        <VStack h='100%' justifyContent='center'>
          <Heading color='diamond.800'>{heading}</Heading>
          <Text color='diamond.300'>{message}</Text>
          {details && (
            <Code
              fontFamily='monospace'
              w='50%'
              h='30%'
              overflow='visible'
              p={3}
            >
              {details}
            </Code>
          )}
          <Link color='diamond.600' href='/'>
            Go home
          </Link>
        </VStack>
      </Box>
      <Footer />
    </div>
  );
};

export { Error };
