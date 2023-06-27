import { Box, HStack, Tag, Text, Link, Progress } from "@chakra-ui/react";
import { Outlet, useLoaderData } from "react-router-dom";
import { Footer } from "components/navigation/footer";
import { AuthState } from "schema/interfaces";
import "styles/main.css";
import { Breadcrumbs } from "components/navigation/breadcrumbs";
import { useIsFetching } from "@tanstack/react-query";
import { LinkDescriptor, Navbar, User } from "diamond-components";
import { useMemo } from "react";

const handleLogin = () =>
  window.location.assign(
    `${process.env.REACT_APP_AUTH_ENDPOINT}authorise?redirect_uri=${encodeURIComponent(
      window.location.href
    )}&responseType=code`
  );

const handleLogout = () =>
  window.location.assign(`${process.env.REACT_APP_AUTH_ENDPOINT}logout?redirect_uri=${window.location.href}`);

const deployType = () => {
  if (process.env.NODE_ENV === "development") {
    return "dev";
  }

  return process.env.REACT_APP_STAGING_HOST === window.location.host ? "beta" : "production";
};

const links: LinkDescriptor[] = [
  {route: "/proposals", label: "Proposals"},
  {route: "/calendar", label: "Calendar"}
]

const PhaseBanner = ({ deployType }: { deployType: "dev" | "production" | "beta" }) => {
  if (deployType === "production") {
    return null;
  }

  return (
    <HStack mx='7.3vw' borderBottom='1px solid var(--chakra-colors-diamond-100)' py='0.2em' mb='0.8em'>
      <Tag fontWeight='600' bg={deployType === "dev" ? "purple" : "diamond.700"} color='diamond.50' borderRadius='0'>
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
  const isFetching = useIsFetching();

  const parsedLinks = useMemo(() => loaderData ? links : [], [loaderData]);

  return (
    <div className='rootContainer'>
      <Box>
        <Navbar links={parsedLinks} logo='/images/diamondgs.png'>
          <User user={loaderData} onLogin={handleLogin} onLogout={handleLogout} />
        </Navbar>
        <Breadcrumbs />
        {isFetching !== 0 ? <Progress h='0.5em' isIndeterminate size='sm' /> : <Box bg='rgba(0,0,0,0)' h='0.5em' />}
      </Box>
      <PhaseBanner deployType={deployType()} />
      <Box className='main'>
        <Outlet />
      </Box>
      <Footer />
    </div>
  );
};

export { Root };
