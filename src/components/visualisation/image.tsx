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
  Card,
  CardHeader,
  CardBody,
} from "@chakra-ui/react";
import { MouseEvent, useState } from "react";
import { BaseCardProp } from "../../utils/interfaces";

interface ImageProps extends BaseCardProp {
  /** Source path for the image */
  src?: string;
}

const ImageCard = ({
  title,
  src = "",
  width = "100%",
  height = "100%",
  showModal = true,
  active = false,
  onClick,
}: ImageProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isZoomed, onToggle: onZoomToggle } = useDisclosure();
  const [zoomCords, setZoomCords] = useState("translate(-50%, -50%)");

  const onClickContainer = () => {
    onOpen();
    if (onClick) {
      onClick();
    }
  };

  const zoom = (event: MouseEvent<HTMLImageElement, globalThis.MouseEvent>) => {
    const { x, y, height, width } = event.currentTarget.getBoundingClientRect();
    setZoomCords(`translate(${(-(event.clientX - x) / width) * 50}%, ${(-(event.clientY - y) / height) * 50}%)`);
    onZoomToggle();
  };

  return (
    <Card aria-selected={active} w={width} h={height} overflow='hidden'>
      <CardHeader onClick={onClickContainer}>
        <Heading aria-label='Image Title' size='sm'>
          {title}
        </Heading>
      </CardHeader>
      <CardBody>
        <Image
          w='100%'
          objectFit='contain'
          src={src}
          margin='auto'
          maxH='100%'
          alt={title}
          fallbackSrc='/images/no-image.png'
        />
        <Modal isOpen={isOpen && showModal} onClose={onClose}>
          <ModalOverlay bg='rgba(0,0,0,0.8)' opacity='0.5' />
          <ModalContent dropShadow='none' bg='none' w='fit-content' maxW='90vw'>
            <ModalHeader aria-label='Image Modal Title' w='80%' color='diamond.200' p={0}>
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
                  objectPosition='top'
                />
              )}
            </Box>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
};

export { ImageCard };
