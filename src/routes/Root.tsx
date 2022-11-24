import { Box, Heading, Progress } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/breadcrumbs";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { checkUser } from "../features/authSlice";
import { useAppDispatch } from "../store/hooks";
import "../styles/main.css";

const Root = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const splitUrl = window.location.href.split("access_token=");

    if (splitUrl.length === 2) {
      sessionStorage.setItem("token", splitUrl[1].split("&token_type")[0].toString());
      const url = new URL(splitUrl[0]).pathname;
      navigate(url);
    }

    dispatch(checkUser()).finally(() => setLoading(false));
  }, [navigate, dispatch]);

  return !loading ? (
    <div className='rootContainer'>
      <Navbar />
      <Box bg='diamond.75' marginTop={12} className='main'>
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

export default Root;
