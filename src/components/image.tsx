import {
  Box,
  Button,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { FunctionComponent } from "react";

interface ImageProp {
  title: string;
  src: string;
  width?: string;
  height?: string;
}

const ImageWrapper: FunctionComponent<ImageProp> = ({ title, src, width = "100%", height = "100%" }): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box onClick={onOpen} p={3} borderWidth='1px' borderRadius='lg' w={width} h={height}>
      <Heading size='sm'>{title}</Heading>
      <Image src={src} fallbackSrc='/images/no-image.png' />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Image src={src} fallbackSrc='/images/no-image.png' />
          </ModalBody>
          <ModalFooter>
            <Button colorScheme='diamond' onClick={onClose}>
              Download
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImageWrapper;
