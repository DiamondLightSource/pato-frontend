import { Box } from "@chakra-ui/react";
import { Outlet, useLoaderData, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "components/navigation/breadcrumbs";
import { Footer } from "components/navigation/footer";
import { Navbar } from "components/navigation/navbar";
import { AuthState } from "schema/interfaces";
import "styles/main.css";
import { useEffect } from "react";

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
      <Box marginTop={8} className='main'>
        <Breadcrumbs />
        <Outlet />
      </Box>
      <Footer />
    </div>
  );
};

export { Root };
