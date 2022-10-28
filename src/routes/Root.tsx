import { Box } from "@chakra-ui/react";
import { Outlet } from "react-router-dom";
import Breadcrumbs from "../components/breadcrumbs";
import Footer from "../components/footer";
import Navbar from "../components/navbar";
import "../styles/main.css";

const Root = (): JSX.Element => {
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
