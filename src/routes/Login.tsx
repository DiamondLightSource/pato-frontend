import {
  Divider,
  Heading,
  Flex,
  Stack,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
  InputLeftElement,
} from "@chakra-ui/react";
import { useState } from "react";
import { MdLock, MdPerson } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../features/auth/authSlice";
import { useAppDispatch } from "../store/hooks";
import { baseToast } from "../styles/components";

const Login = (): JSX.Element => {
  const [show, setShow] = useState(false);
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("false");
  const [loading, setLoading] = useState(false);

  const handlePasswordShow = (): void => setShow(!show);

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const toast = useToast();

  const login = async () => {
    setLoading(true);
    await dispatch(loginUser({ username: user, password: pass }))
      .unwrap()
      .then(() => {
        toast({ ...baseToast, title: `Success! Logged in as ${user}` });
        navigate("/proposals");
      })
      .catch(() => {
        toast({
          ...baseToast,
          title: "Login failed. Check your credentials and try again.",
          status: "error",
        });
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <div>
      <Heading>Login</Heading>
      <Divider />
      <Flex justifyContent='center' alignItems='center'>
        <Stack
          py={6}
          width={{ base: "90%", md: "468px" }}
          flexDir='column'
          mb='2'
          justifyContent='center'
          alignItems='center'
        >
          <InputGroup size='md'>
            <InputLeftElement pointerEvents='none' children={<MdPerson color='#CBD5E0' />} />
            <Input pr='4.5rem' placeholder='FedID' onChange={(event) => setUser(event.target.value)} />
          </InputGroup>
          <InputGroup size='md'>
            <InputLeftElement pointerEvents='none' children={<MdLock color='#CBD5E0' />} />
            <Input
              pr='4.5rem'
              type={show ? "text" : "password"}
              placeholder='Password'
              onChange={(event) => setPass(event.target.value)}
            />
            <InputRightElement width='4.5rem'>
              <Button h='1.75rem' size='sm' onClick={handlePasswordShow}>
                {show ? "Hide" : "Show"}
              </Button>
            </InputRightElement>
          </InputGroup>
          {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
          <Button isLoading={loading} onClick={() => login()} width='full'>
            Login
          </Button>
        </Stack>
      </Flex>
    </div>
  );
};

export default Login;
