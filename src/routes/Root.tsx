import { Alert } from "@chakra-ui/react"
import { Outlet } from "react-router-dom"
import Breadcrumbs from "../components/breadcrumbs"
import Footer from "../components/footer"
import Navbar from "../components/navbar"
import "../styles/main.css"

const Root = (): JSX.Element => {
  return (
    <div className="rootContainer">
      <Navbar />
      <div className="main">
        <Breadcrumbs />
        <Outlet />
      </div>
      {false ?? <Alert maxWidth="sm" status='success' variant='left-accent'>
        Alert Text Placeholder
      </Alert>}
      <Footer />
    </div>
  )
}

export default Root
