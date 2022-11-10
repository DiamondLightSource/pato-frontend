import { Box } from "@chakra-ui/react";
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Breadcrumbs from "../components/breadcrumbs";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import { useAppDispatch } from "../store/hooks";
import "../styles/main.css";

const Root = (): JSX.Element => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const splitUrl = window.location.href.split("access_token=");

    if (splitUrl.length === 2) {
      sessionStorage.setItem("token", splitUrl[1].split("&token_type")[0].toString());
      const url = new URL(splitUrl[0]).pathname;
      navigate(url);
    }
  }, [navigate, dispatch]);

  return (
    <div className='rootContainer'>
      <Navbar />
      <Box marginTop={12} className='main'>
        <Breadcrumbs />
        <Outlet />
      </Box>
      <Footer />
    </div>
  );
};

export default Root;
