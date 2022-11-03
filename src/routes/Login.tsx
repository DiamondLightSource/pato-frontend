import {
  Divider,
  Heading,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  useToast,
  InputLeftElement,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState } from "react";
import { MdLock, MdPerson } from "react-icons/md";
import { useLocation, useNavigate } from "react-router-dom";
import { loginUser } from "../features/authSlice";
import { useAppDispatch } from "../store/hooks";
import { baseToast } from "../styles/components";
import { useForm, FieldValues } from "react-hook-form";

const Login = (): JSX.Element => {
  const [show, setShow] = useState(false);

  const handlePasswordShow = (): void => setShow(!show);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { state } = useLocation();
  const toast = useToast();

  const login = async (values: FieldValues) => {
    const creds = { username: values.username, password: values.password };
    await dispatch(loginUser(creds))
      .unwrap()
      .then(() => {
        toast({ ...baseToast, title: `Success! Logged in as ${creds.username}` });
        if (state && state.redirect) {
          navigate(-1);
        } else {
          navigate("/proposals");
        }
      })
      .catch(() => {
        toast({
          ...baseToast,
          title: "Login failed. Check your credentials and try again.",
          status: "error",
        });
      });
    return;
  };

  return (
    <div>
      <Heading>Login</Heading>
      <Divider />
      <Flex py={4} justifyContent='center' alignItems='center'>
        <form onSubmit={handleSubmit(login)}>
          <FormControl isInvalid={!!errors.username}>
            <InputGroup size='md'>
              <InputLeftElement pointerEvents='none' children={<MdPerson color='#CBD5E0' />} />
              <Input
                id='username'
                pr='4.5rem'
                placeholder='FedID'
                {...register("username", { required: "FedID is required" })}
              />
            </InputGroup>
            <FormErrorMessage>{!!errors.username && errors.username.message?.toString()}</FormErrorMessage>
          </FormControl>
          <FormControl isInvalid={!!errors.password}>
            <InputGroup marginY={2} size='md'>
              <InputLeftElement pointerEvents='none' children={<MdLock color='#CBD5E0' />} />
              <Input
                id='password'
                pr='4.5rem'
                type={show ? "text" : "password"}
                placeholder='Password'
                {...register("password", { required: "Password is required" })}
              />
              <InputRightElement width='4.5rem'>
                <Button h='1.75rem' size='sm' onClick={handlePasswordShow}>
                  {show ? "Hide" : "Show"}
                </Button>
              </InputRightElement>
            </InputGroup>
            <FormErrorMessage>{!!errors.password && errors.password.message?.toString()}</FormErrorMessage>
          </FormControl>
          <Button isLoading={isSubmitting} type='submit' width='full'>
            Login
          </Button>
        </form>
      </Flex>
    </div>
  );
};

export default Login;
