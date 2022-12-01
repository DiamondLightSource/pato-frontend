import {
  Box,
  Heading,
  Image,
  Modal,
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
      <Image src={src} margin='auto' maxH='100%' paddingBottom={5} fallbackSrc='/images/no-image.png' />
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay bg='rgba(0,0,0,0.8)' opacity='0.5' />
        <ModalContent bg='none' w='fit-content' maxW='90vw'>
          <ModalHeader w='80%' color='diamond.200' p={0}>
            {title}
          </ModalHeader>
          <ModalCloseButton color='diamond.200' m='-10px' />
          <Box overflow='hidden' w='40vw' h='80vh'>
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
                w='100%'
                h='100%'
                objectFit='contain'
                onClick={(e) => zoom(e)}
                src={src}
                fallbackSrc='/images/no-image.png'
              />
            )}
          </Box>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default ImageWrapper;
