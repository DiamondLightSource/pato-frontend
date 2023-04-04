import {
  Box,
  Divider,
  HStack,
  Tag,
  VStack,
  Text,
  Link,
} from "@chakra-ui/react";
import { Outlet, useLoaderData, useSearchParams } from "react-router-dom";
import { Footer } from "components/navigation/footer";
import { Navbar } from "components/navigation/navbar";
import { AuthState } from "schema/interfaces";
import "styles/main.css";
import { useEffect } from "react";

const PhaseBanner = () => (
  <VStack mb='10px'>
    <HStack w='100%'>
      <Tag
        fontWeight='600'
        bg='diamond.700'
        color='diamond.50'
        borderRadius='0'
      >
        BETA
      </Tag>
      <Text>
        This version of the service is still in testing, report any issues to
        the <Link color='diamond.700'>developers.</Link>
      </Text>
    </HStack>
    <Divider borderColor='diamond.200' />
  </VStack>
);

const Root = () => {
  const loaderData = useLoaderData() as AuthState | null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (window.location.href.split("code=").length === 2) {
      setSearchParams(
        (prev) => [...prev.entries()].filter((param) => param[0] !== "code"),
        { replace: true }
      );
    }
  }, [setSearchParams]);

  return (
    <div className='rootContainer'>
      <Navbar user={loaderData} />
      <Box className='main'>
        {process.env.REACT_APP_DEPLOY_TYPE === "beta" && <PhaseBanner />}
        <Outlet />
      </Box>
      <Footer />
    </div>
  );
};

export { Root };
