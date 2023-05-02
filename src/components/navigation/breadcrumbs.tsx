import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";

import { MdHome } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();

  const pathCrumbs = location.pathname.split("/").filter((name) => name !== "");

  if (pathCrumbs.length === 0) return null;

  const currentPage = pathCrumbs.pop();
  let partialPath: Array<string> = Array(pathCrumbs.length + 1).fill("..");

  return (
    <Breadcrumb
      bg='diamond.700'
      w='100%'
      color='diamond.50'
      fontSize='0.9em'
      py='0.2em'
      px='7.6vw'
      id='breadcrumbs'
      separator='>'
    >
      <BreadcrumbItem>
        <BreadcrumbLink _hover={{ opacity: "0.6" }} aria-label='Home' as={Link} to='/'>
          <MdHome />
        </BreadcrumbLink>
      </BreadcrumbItem>
      {pathCrumbs.map((pathname) => {
        partialPath.pop();
        return (
          <BreadcrumbItem key={pathname}>
            <BreadcrumbLink preventScrollReset={true} as={Link} to={partialPath.join("/")} relative='path'>
              {pathname}
            </BreadcrumbLink>
          </BreadcrumbItem>
        );
      })}
      <BreadcrumbItem color='diamond.500'>
        <BreadcrumbLink color='diamond.500' isCurrentPage key={currentPage}>
          {currentPage}
        </BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  );
};

export { Breadcrumbs };
