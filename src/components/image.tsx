import {
  Box,
  Heading,
  Image,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { FunctionComponent, MouseEvent, useState } from "react";

interface ImageProp {
  title: string;
  src: string;
  width?: string;
  height?: string;
}

const ImageWrapper: FunctionComponent<ImageProp> = ({ title, src, width = "100%", height = "100%" }): JSX.Element => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isZoomed, onToggle: onZoomToggle } = useDisclosure();
  const [zoomCords, setZoomCords] = useState("translate(-50%, -50%)");

  const zoom = (event: MouseEvent<HTMLImageElement, globalThis.MouseEvent>) => {
    const { x, y, height, width } = event.currentTarget.getBoundingClientRect();
    setZoomCords(`translate(${(-(event.clientX - x) / width) * 50}%, ${(-(event.clientY - y) / height) * 50}%)`);
    onZoomToggle();
  };

  return (
    <Box onClick={onOpen} p={3} borderWidth='1px' borderRadius='lg' w={width} h={height} overflow='hidden'>
      <Heading size='sm' paddingBottom={1}>
        {title}
      </Heading>
      <Image src={src} margin='auto' h='100%' paddingBottom={5} fallbackSrc='/images/no-image.png' />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent w='fit-content' maxW='90vw'>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box overflow='hidden' w='600px' h='550px'>
              {isZoomed ? (
                <Image
                  cursor='zoom-out'
                  position='relative'
                  style={{ transform: zoomCords }}
                  maxW='180%'
                  w='180%'
                  onClick={() => onZoomToggle()}
                  src={src}
                  fallbackSrc='/images/no-image.png'
                />
              ) : (
                <Image
                  cursor='zoom-in'
                  w='100%'
                  h='100%'
                  paddingBottom={2}
                  onClick={(e) => zoom(e)}
                  src={src}
                  fallbackSrc='/images/no-image.png'
                />
              )}
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImageWrapper;
