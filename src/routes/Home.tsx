import {
  Box,
  Button,
  Divider,
  GridItem,
  Heading,
  HStack,
  Link,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  VStack,
} from "@chakra-ui/react";
import { MdLogin } from "react-icons/md";

import { Link as LinkRouter, useLoaderData } from "react-router-dom";
import { components } from "schema/main";

type Session = components["schemas"]["SessionResponse"];

interface SessionRowProps {
  sessions: Session[];
  title: string;
}

const SessionRow = ({ sessions, title }: SessionRowProps) => (
  <VStack w='100%' spacing={0}>
    <Heading textAlign='left' w='100%' size='lg'>
      {title}
    </Heading>
    <Divider borderColor='diamond.300' />
    <HStack w='100%' spacing='0.5%' py='0.8em'>
      {sessions && sessions.length > 0 ? (
        sessions.map((session) => (
          <Link
            w='19.6%'
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
        ))
      ) : (
        <GridItem colSpan={5}>
          <Heading textAlign='center' py={4} variant='notFound'>
            No {title} Found
          </Heading>
        </GridItem>
      )}
    </HStack>
  </VStack>
);

const Home = () => {
  const sessions = useLoaderData() as {
    recent: Session[];
    current: Session[];
  } | null;

  return (
    <div className='rootContainer'>
      <title>PATo</title>
      <Box mt='-1em' mx='-7.3vw' bg='diamond.50' flex='1 0 auto'>
        <Box w='100%' overflow='hidden'>
          <VStack className='homeRoot'>
            <VStack bg='diamond.700' justifyContent='start' alignItems='start'>
              <Heading size='xl' color='diamond.50'>
                PATo Visualisation Interface
              </Heading>
              <Heading pt='2vh' color='diamond.50' fontWeight='200' size='md'>
                (Single) Particle Analysis and Tomography Data Visualisation Interface
              </Heading>
              <HStack>
                <Link as={LinkRouter} to='/proposals'>
                  <Button variant='onBlue'>List Proposals</Button>
                </Link>
                <Link as={LinkRouter} to='/calendar'>
                  <Button variant='onBlue'>View Calendar</Button>
                </Link>
              </HStack>
            </VStack>

            <VStack mt='0 !important' w='100%' px='10vw' justifyContent='start' alignItems='start'>
              {sessions ? (
                <VStack w='100%' spacing={5}>
                  <SessionRow title='Recent Sessions' sessions={sessions.recent} />
                  <SessionRow title='Current Sessions' sessions={sessions.current} />
                </VStack>
              ) : (
                <VStack w='100%'>
                  <Heading w='100%' py={4} variant='notFound'>
                    You must be logged in to view recent sessions
                  </Heading>
                  <Link
                    href={`${
                      process.env.REACT_APP_AUTH_ENDPOINT
                    }authorise?redirect_uri=${encodeURIComponent(
                      window.location.href
                    )}&responseType=code`}
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
