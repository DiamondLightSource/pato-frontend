import { Breadcrumb, BreadcrumbItem, BreadcrumbLink } from "@chakra-ui/react";

import { MdHome } from "react-icons/md";
import { Link, useLocation } from "react-router-dom";

const Breadcrumbs = () => {
  const location = useLocation();

  const pathCrumbs = location.pathname.split("/").filter((name) => {
    return name !== "";
  });
  
  if (pathCrumbs.length === 0) return null;

  const currentPage = pathCrumbs.pop();
  let partialPath: Array<string> = Array(pathCrumbs.length + 1).fill("..");

  return (
    <Breadcrumb mb={4} id='breadcrumbs' separator='>'>
      <BreadcrumbItem>
        <BreadcrumbLink aria-label='Home' as={Link} to='/'>
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
      <BreadcrumbItem>
        <BreadcrumbLink isCurrentPage key={currentPage}>
          {currentPage}
        </BreadcrumbLink>
      </BreadcrumbItem>
    </Breadcrumb>
  );
};

export { Breadcrumbs };
