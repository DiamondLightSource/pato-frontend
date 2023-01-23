import { Box, Heading, Progress } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { Breadcrumbs } from "../components/navigation/breadcrumbs";
import { Footer } from "../components/navigation/footer";
import { Navbar } from "../components/navigation/navbar";
import { checkUser } from "../features/authSlice";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import "../styles/main.css";

const Root = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);
  const user = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    const splitUrl = window.location.href.split("access_token=");

    if (splitUrl.length === 2) {
      sessionStorage.setItem("token", splitUrl[1].split("&token_type")[0].toString());
      const url = new URL(splitUrl[0]).pathname;
      navigate(url);
    }

    if (!user) {
      dispatch(checkUser());
    }

    setLoading(false);
  }, [navigate, dispatch, user]);

  return !loading ? (
    <div className='rootContainer'>
      <Navbar />
      <Box bg='diamond.50' marginTop={8} className='main'>
        <Breadcrumbs />
        <Outlet />
      </Box>
      <Footer />
    </div>
  ) : (
    <Box margin='30% auto' w='20%' h='100%'>
      <Heading p={4} textAlign='center'>
        Fetching Data...
      </Heading>
      <Progress isIndeterminate />
    </Box>
  );
};

export { Root };
