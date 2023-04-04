import { Box } from "@chakra-ui/react";
import { Outlet, useLoaderData, useSearchParams } from "react-router-dom";
import { Breadcrumbs } from "components/navigation/breadcrumbs";
import { Footer } from "components/navigation/footer";
import { Navbar } from "components/navigation/navbar";
import { AuthState } from "schema/interfaces";
import "styles/main.css";
import { useEffect } from "react";
import { client } from "utils/api/client";

const Root = () => {
  const loaderData = useLoaderData() as AuthState | null;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_, setSearchParams] = useSearchParams();

  useEffect(() => {
    const url = encodeURIComponent(window.location.href);
    const splitUrl = window.location.href.split("code=");

    if (splitUrl.length === 2) {
      client
        .authGet(`token?redirect_uri=${url}&code=${splitUrl[1]}`)
        .then(() => {
          setSearchParams((prev) =>
            [...prev.entries()].filter((param) => param[0] !== "code")
          );
        });
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
