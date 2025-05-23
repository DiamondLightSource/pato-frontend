import { Box, HStack, Text, Link, Progress } from "@chakra-ui/react";
import { Outlet, useLoaderData, useLocation } from "react-router";
import { Footer } from "components/navigation/footer";
import { useIsFetching } from "@tanstack/react-query";
import {
  Navbar,
  User,
  AuthState,
  Breadcrumbs,
  NavLinks,
  NavLink,
} from "@diamondlightsource/ui-components";
import { useMemo } from "react";
import "styles/main.css";
import { VersionTag } from "components/navigation/versionTag";

const handleLogin = () =>
  window.location.assign(
    `${window.ENV.AUTH_URL}authorise?redirect_uri=${encodeURIComponent(
      window.location.href
    )}&responseType=code`
  );

const handleLogout = () =>
  window.location.assign(`${window.ENV.AUTH_URL}logout?redirect_uri=${window.location.href}`);

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
      <VersionTag deployType={deployType} />
      <Text>
        This version of the service is still in testing, report any issues to the{" "}
        <Link color='diamond.700' href={"mailto:" + window.ENV.DEV_CONTACT}>
          developers.
        </Link>
      </Text>
    </HStack>
  );
};

const Root = () => {
  const loaderData = useLoaderData() as AuthState | null;
  const isFetching = useIsFetching();
  const location = useLocation();

  const deployType = useMemo(() => {
    if (process.env.NODE_ENV === "development") {
      return "dev";
    }

    return window.ENV.ENVIRONMENT === "staging" ? "beta" : "production";
  }, []);

  return (
    <div className='rootContainer'>
      <Box>
        <Navbar logo='/images/diamondgs.png'>
          <>
            <NavLinks>
              <NavLink href='/proposals'>Proposals</NavLink>
              <NavLink href='/calendar'>Calendar</NavLink>
            </NavLinks>
            <User user={loaderData} onLogin={handleLogin} onLogout={handleLogout} />
          </>
        </Navbar>
        <Breadcrumbs path={location.pathname} />
        {isFetching !== 0 ? (
          <Progress h='0.5em' isIndeterminate size='sm' />
        ) : (
          <Box bg='rgba(0,0,0,0)' h='0.5em' />
        )}
      </Box>
      <PhaseBanner deployType={deployType} />
      <Box className='main'>
        <Outlet />
      </Box>
      <Footer />
    </div>
  );
};

export { Root };
