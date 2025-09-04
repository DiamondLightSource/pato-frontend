import { Box, Heading, Link, Text, VStack } from "@chakra-ui/react";

const InvalidUserPage = () => (
  <div className='rootContainer'>
    <Box marginTop={12} className='main'>
      <VStack h='100%' justifyContent='center'>
        <Heading color='diamond.800'>User not recognised</Heading>
        <Text color='diamond.300'>
          This user could not be recognised. If you have logged in with your email address,{" "}
          <Link
            color='diamond.700'
            href={`${window.ENV.AUTH_URL}logout?redirect_uri=${window.location.href}`}
          >
            log out of the SSO provider
          </Link>{" "}
          and log in with your FedID.
        </Text>
      </VStack>
    </Box>
  </div>
);

export default InvalidUserPage;
