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
  /** Title for the image */
  title: string;
  /** Source path for the image */
  src: string;
  /** Image width */
  width?: string;
  /** Image height */
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
        <ModalContent>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Box overflow='hidden'>
              {isZoomed ? (
                <Image
                  data-testid='zoomed-in-image'
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
                  data-testid='zoomed-out-image'
                  cursor='zoom-in'
                  w='auto'
                  h='auto'
                  maxW='90vw'
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
