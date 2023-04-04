import { Heading, VStack } from "@chakra-ui/react";

const NoData = () => (
  <VStack width='100%' height='100%'>
    <Heading my='auto' variant='notFound'>
      No Data Available
    </Heading>
  </VStack>
);

export { NoData };
