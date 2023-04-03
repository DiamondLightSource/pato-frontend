import { ReactElement } from "react";
import {
  Box,
  Flex,
  Avatar,
  HStack,
  Link,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  Image,
  Progress,
  Text,
  VStack,
} from "@chakra-ui/react";
import { MdLogin, MdMenu, MdClose } from "react-icons/md";
import { Link as LinkRouter } from "react-router-dom";
import { AuthState } from "schema/interfaces";
import { useIsFetching } from "@tanstack/react-query";
import { PhaseBanner } from "./phaseBanner";

const links = [
  { label: "Proposals", route: "proposals" },
  { label: "Calendar", route: "calendar" },
];

interface NavLinkProps {
  children?: ReactElement | string;
  link: string;
}

interface NavLinksProps {
  loggedIn: boolean;
}

const NavLink = ({ children, link }: NavLinkProps) => (
  <Link
    height='100%'
    alignItems='center'
    display='flex'
    px={2}
    as={LinkRouter}
    borderTop='4px solid transparent'
    borderBottom='4px solid transparent'
    color='diamond.50'
    _hover={{
      color: "diamond.500",
      borderBottom: "solid 4px",
    }}
    to={link}
  >
    {children}
  </Link>
);

const NavLinks = ({ loggedIn }: NavLinksProps) => (
  <>
    {loggedIn
      ? links.map((link) => (
          <NavLink link={link.route} key={link.label}>
            {link.label}
          </NavLink>
        ))
      : null}
  </>
);

interface NavbarProps {
  user?: AuthState | null;
}

const Navbar = ({ user }: NavbarProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const loadingRemaining = useIsFetching();

  return (
    <Box zIndex={1} w='100%'>
      <Flex bg='diamond.800' px={{ base: 4, md: "7.5vw" }} h={12} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"sm"}
          icon={isOpen ? <MdClose /> : <MdMenu />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack h='100%' spacing={8} alignItems={"center"}>
          <NavLink link='/'>
            <Box maxW='5rem'>
              <Image
                alt='Home'
                _hover={{ filter: "brightness(70%)" }}
                fit='cover'
                paddingBottom={{ md: "6px", base: 0 }}
                src='/images/diamondgs.png'
              />
            </Box>
          </NavLink>
          <HStack h='100%' as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            <NavLinks loggedIn={user !== null} />
          </HStack>
        </HStack>
        <Flex alignItems={"center"}>
          {user ? (
            <Menu>
              <MenuButton
                aria-label='User Avatar'
                borderRadius={12}
                as={Button}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
                _hover={{
                  opacity: 0.8,
                }}
              >
                <HStack>
                  <div style={{ padding: 10 }}>
                    <Text color='diamond.100' display='inline-block'>
                      {user.name}
                    </Text>
                    <Text textAlign='left' fontSize='xs'>
                      {user.fedid}
                    </Text>
                  </div>
                  <Avatar size='xs' />
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem aria-label='Logout'>
                  <Link href={`${process.env.REACT_APP_AUTH_ENDPOINT}logout?redirect_uri=${window.location.href}`}>
                    Logout
                  </Link>
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link
              href={`${process.env.REACT_APP_AUTH_ENDPOINT}authorise?redirect_uri=${encodeURIComponent(
                window.location.href
              )}&responseType=code`}
            >
              <Button variant='onBlue' leftIcon={<MdLogin />}>
                Login
              </Button>
            </Link>
          )}
        </Flex>
      </Flex>
      {process.env.REACT_APP_DEPLOY_TYPE === "staging" && <PhaseBanner />}
      {!isOpen && loadingRemaining !== 0 ? (
        <Progress h='0.5em' isIndeterminate size='sm' />
      ) : (
        <Box bg='rgba(0,0,0,0)' h='0.5em' />
      )}
      {isOpen && (
        <VStack bg='diamond.800' as={"nav"} spacing={4}>
          <NavLinks loggedIn={user !== null} />
        </VStack>
      )}
    </Box>
  );
};

export { Navbar };
