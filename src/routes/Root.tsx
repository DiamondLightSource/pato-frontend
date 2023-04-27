import { Box, HStack, Tag, Text, Link } from "@chakra-ui/react";
import { Outlet, useLoaderData } from "react-router-dom";
import { Footer } from "components/navigation/footer";
import { Navbar } from "components/navigation/navbar";
import { AuthState } from "schema/interfaces";
import "styles/main.css";

const deployType = () => {
  if (process.env.NODE_ENV === "development") {
    return "dev";
  }

  return process.env.REACT_APP_STAGING_HOST === window.location.host ? "beta" : "production";
};

const PhaseBanner = ({ deployType }: { deployType: "dev" | "production" | "beta" }) => {
  if (deployType === "production") {
    return null;
  }

  return (
    <HStack
      mx='7.3vw'
      borderBottom='1px solid var(--chakra-colors-diamond-100)'
      py='0.2em'
      mb='0.8em'
    >
      <Tag
        fontWeight='600'
        bg={deployType === "dev" ? "purple" : "diamond.700"}
        color='diamond.50'
        borderRadius='0'
      >
        {deployType.toUpperCase()}
      </Tag>
      <Text>
        This version of the service is still in testing, report any issues to the{" "}
        <Link color='diamond.700' href={"mailto:" + process.env.REACT_APP_DEV_CONTACT}>
          developers.
        </Link>
      </Text>
    </HStack>
  );
};

const Root = () => {
  const loaderData = useLoaderData() as AuthState | null;

  return (
    <div className='rootContainer'>
      <Navbar user={loaderData} />
      <PhaseBanner deployType={deployType()} />
      <Box className='main'>
        <Outlet />
      </Box>
      <Footer />
    </div>
  );
};

export { Root };
