import { Box } from "@chakra-ui/react";
import { Outlet, useLoaderData } from "react-router-dom";
import { Breadcrumbs } from "components/navigation/breadcrumbs";
import { Footer } from "components/navigation/footer";
import { Navbar } from "components/navigation/navbar";
import { AuthState } from "schema/interfaces";
import "styles/main.css";

const Root = (): JSX.Element => {
  const loaderData = useLoaderData() as AuthState;

  return (
    <div className='rootContainer'>
      <Navbar user={loaderData} />
      <Box bg='diamond.50' marginTop={8} className='main'>
        <Breadcrumbs />
        <Outlet />
      </Box>
      <Footer />
    </div>
  );
};

export { Root };
