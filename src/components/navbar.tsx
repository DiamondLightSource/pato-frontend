import { FunctionComponent, ReactNode } from 'react'
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
  Stack
} from '@chakra-ui/react'
import { MdLogin, MdMenu, MdClose } from 'react-icons/md'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { logoutUser } from '../features/auth/authSlice'
import { Link as LinkRouter } from 'react-router-dom'

const Links = ['Proposals', 'Placeholder 2', 'Placeholder 3']

const NavLink = ({ children }: { children: ReactNode }): JSX.Element => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    color={'gray.200'}
    _hover={{
      textDecoration: 'none',
      bg: 'diamond.700'
    }}
    href={'#'}>
    {children}
  </Link>
)

const Navbar: FunctionComponent = (): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const dispatch = useAppDispatch()
  const token = useAppSelector((state) => state.auth.token)

  return (
    <Box bg='diamond.800' px={{ base: 4, md: 48 }}>
      <Flex h={12} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'sm'}
          icon={isOpen ? <MdClose /> : <MdMenu />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <LinkRouter to={"/"}>
            <Box maxW="5rem"><Image fit="cover" paddingBottom={{ md: '6px', base: 0 }} src="/images/diamondgs.png" /></Box>
          </LinkRouter>
          <HStack
            as={'nav'}
            spacing={4}
            display={{ base: 'none', md: 'flex' }}>
            {Links.map((link) => (
              <NavLink key={link}>{link}</NavLink>
            ))}
          </HStack>
        </HStack>
        <Flex alignItems={'center'}>
          {token !== undefined && token !== ''
            ? <Menu>
              <MenuButton
                as={Button}
                rounded={'full'}
                variant={'link'}
                cursor={'pointer'}
                minW={0}>
                <Avatar size='xs' />
              </MenuButton>
              <MenuList>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <MenuItem onClick={() => dispatch(logoutUser())}>Logout</MenuItem>
              </MenuList>
            </Menu>
            : <LinkRouter to={"/login"}><Button bg='diamond.500' color='gray.100' size="sm" leftIcon={<MdLogin />}>Login</Button></LinkRouter>}
        </Flex>
      </Flex>

      {isOpen
        ? (
          <Box pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {Links.map((link) => (
                <NavLink key={link}>{link}</NavLink>
              ))}
            </Stack>
          </Box>
        )
        : null}
    </Box>
  )
}

export default Navbar