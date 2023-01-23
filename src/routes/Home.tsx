import {
  Box,
  Button,
  Divider,
  Grid,
  Heading,
  HStack,
  Link,
  Spacer,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  Text,
  UnorderedList,
  VStack,
} from "@chakra-ui/react";

import { Link as LinkRouter } from "react-router-dom";

const Home = () => (
  <div className='rootContainer'>
    <title>eBIC</title>
    <Box mt={-8} mx='-10vw' bg='diamond.50' flex='1 0 auto'>
      <Box w='100%' overflow='hidden'>
        <VStack className='homeRoot'>
          <VStack bg='diamond.700' justifyContent='start' alignItems='start'>
            <Heading size='xl' color='diamond.50'>
              eBIC Experiment Data Display
            </Heading>
            <Heading pt='2vh' color='diamond.50' fontWeight='200' size='md'>
              Single Particle Analysis and Tomography Data Visualisation Tool
            </Heading>
            <HStack>
              <Link href='https://gitlab.diamond.ac.uk/lims/ebic-frontend'>
                <Button variant='onBlue'>View Code</Button>
              </Link>
              <Link as={LinkRouter} to='/proposals'>
                <Button variant='onBlue'>List Proposals</Button>
              </Link>
            </HStack>
          </VStack>
          {/*<VStack mt='0 !important' w='100%' px='10vw' justifyContent='start' alignItems='start'>
            <Heading pt={4} size='lg'>
              Recent Sessions
            </Heading>
            <Grid w='100%' py={2} marginBottom={6} templateColumns='repeat(5, 1fr)' gap={2}>
              <Stat bg='diamond.50' overflow='hidden' w='calc(100%)' p={2} border='1px solid grey' borderRadius={5}>
                <StatLabel whiteSpace='nowrap' textOverflow='ellipsis' overflow='hidden'></StatLabel>
                <StatNumber></StatNumber>
                <StatHelpText mb='0'></StatHelpText>
                <StatHelpText mb='0'></StatHelpText>
              </Stat>
            </Grid>
</VStack>*/}
        </VStack>
      </Box>
    </Box>
  </div>
);

export { Home };
