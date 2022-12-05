import { FunctionComponent, ReactElement } from "react";
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
  Stack,
  Progress,
  Text,
} from "@chakra-ui/react";
import { MdLogin, MdMenu, MdClose } from "react-icons/md";
import { useAppSelector } from "../store/hooks";
import { Link as LinkRouter } from "react-router-dom";

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

const NavLink = ({ children, link }: NavLinkProps): JSX.Element => (
  <Link
    px={2}
    py={1}
    as={LinkRouter}
    rounded={"md"}
    color={"gray.200"}
    _hover={{
      textDecoration: "none",
      bg: "diamond.700",
    }}
    to={link}
  >
    {children}
  </Link>
);

const NavLinks = ({ loggedIn }: NavLinksProps): JSX.Element => (
  <div>
    {loggedIn &&
      links.map((link) => (
        <NavLink link={link.route} key={link.label}>
          {link.label}
        </NavLink>
      ))}
  </div>
);

const Navbar: FunctionComponent = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const user = useAppSelector((state) => state.auth.user);
  const loading = useAppSelector((state) => state.ui.loading);

  return (
    <Box zIndex={1} position='fixed' w='100%' bg='diamond.800'>
      <Flex px={{ base: 4, md: 48 }} h={12} alignItems={"center"} justifyContent={"space-between"}>
        <IconButton
          size={"sm"}
          icon={isOpen ? <MdClose /> : <MdMenu />}
          aria-label={"Open Menu"}
          display={{ md: "none" }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={"center"}>
          <LinkRouter to={"/"}>
            <Box maxW='5rem'>
              <Image
                _hover={{ filter: "brightness(70%)" }}
                fit='cover'
                paddingBottom={{ md: "6px", base: 0 }}
                src='/images/diamondgs.png'
              />
            </Box>
          </LinkRouter>
          <HStack as={"nav"} spacing={4} display={{ base: "none", md: "flex" }}>
            <NavLinks loggedIn={user !== null} />
          </HStack>
        </HStack>
        <Flex alignItems={"center"}>
          {user !== null ? (
            <Menu>
              <MenuButton
                borderRadius={12}
                bg='diamond.500'
                as={Button}
                rounded={"full"}
                variant={"link"}
                cursor={"pointer"}
                minW={0}
                _hover={{ bg: "diamond.600" }}
              >
                <Avatar size='xs' />
                <Text verticalAlign='bottom' px={3} color='diamond.100' display='inline-block'>
                  {user.name} ({user.fedid})
                </Text>
              </MenuButton>
              <MenuList>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <MenuItem
                  onClick={() => {
                    sessionStorage.removeItem("token");
                    window.location.href = `${process.env.REACT_APP_AUTH_ENDPOINT}logout?redirect_uri=${window.location.href}`;
                  }}
                >
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          ) : (
            <Link
              href={`${process.env.REACT_APP_AUTH_ENDPOINT}authorise?redirect_uri=${encodeURIComponent(
                window.location.href
              )}`}
            >
              <Button bg='diamond.500' color='gray.100' size='sm' leftIcon={<MdLogin />}>
                Login
              </Button>
            </Link>
          )}
        </Flex>
      </Flex>
      {!isOpen && loading && <Progress isIndeterminate size='sm' />}

      {isOpen && (
        <Box pb={4} display={{ md: "none" }}>
          <Stack as={"nav"} spacing={4}>
            <NavLinks loggedIn={user !== null} />
          </Stack>
        </Box>
      )}
    </Box>
  );
};

export default Navbar;
