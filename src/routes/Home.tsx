import {
  Box,
  Button,
  Divider,
  Grid,
  Heading,
  HStack,
  Link,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  VStack,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { MdLogin } from "react-icons/md";

import { Link as LinkRouter } from "react-router-dom";
import { components } from "../schema/main";
import { client } from "../utils/api/client";

type Session = components["schemas"]["VisitOut"];

const Home = () => {
  const [sessions, setSessions] = useState<Session[] | null>();

  useEffect(() => {
    client.get("sessions?limit=5&page=0&search=m").then((response) => {
      if (response.status !== 200) {
        setSessions(null);
        return;
      }

      setSessions(response.data.items);
    });
  }, []);

  return (
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

            <VStack mt='0 !important' w='100%' px='10vw' justifyContent='start' alignItems='start'>
              <Heading size='lg'>Recent Sessions</Heading>
              <Divider borderColor='diamond.300' />
              {sessions ? (
                <Grid w='100%' py={2} marginBottom={6} templateColumns='repeat(5, 1fr)' gap={2}>
                  {sessions.map((session) => (
                    <Link
                      key={session.sessionId}
                      _hover={{ textDecor: "none" }}
                      as={LinkRouter}
                      to={`/proposals/${session.parentProposal}/sessions/${session.visit_number ?? 0}`}
                    >
                      <Stat
                        _hover={{
                          borderColor: "diamond.400",
                        }}
                        bg='diamond.50'
                        overflow='hidden'
                        w='calc(100%)'
                        p={2}
                        border='1px solid grey'
                        borderRadius={5}
                      >
                        <StatLabel whiteSpace='nowrap' textOverflow='ellipsis' overflow='hidden'>
                          {session.beamLineName} {session.beamLineOperator && "-"} {session.beamLineOperator}
                        </StatLabel>
                        <StatNumber>
                          {session.parentProposal}-{session.visit_number ?? "?"}
                        </StatNumber>
                        <StatHelpText mb='0'>
                          <b>Start: </b>
                          {session.startDate}{" "}
                        </StatHelpText>
                        <StatHelpText mb='0'>
                          <b>End: </b>
                          {session.endDate}
                        </StatHelpText>
                      </Stat>
                    </Link>
                  ))}
                </Grid>
              ) : (
                <VStack w='100%'>
                  <Heading w='100%' py={4} variant='notFound'>
                    You must be logged in to view recent sessions
                  </Heading>
                  <Link
                    href={`${process.env.REACT_APP_AUTH_ENDPOINT}authorise?redirect_uri=${encodeURIComponent(
                      window.location.href
                    )}`}
                  >
                    <Button leftIcon={<MdLogin />}>Login</Button>
                  </Link>
                </VStack>
              )}
            </VStack>
          </VStack>
        </Box>
      </Box>
    </div>
  );
};

export { Home };
