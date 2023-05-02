import {
  Card,
  CardBody,
  CardHeader,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";

import { ParentSize } from "@visx/responsive";
import { BaseCardProp } from "schema/interfaces";
import { cloneElement, ReactElement } from "react";

interface PlotContainerProps extends BaseCardProp {
  /** Child plot */
  children: ReactElement;
}

const PlotContainer = ({
  title,
  width = "100%",
  height = "100%",
  active = false,
  children,
  onClick,
  ...cardProps
}: PlotContainerProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Card aria-selected={active} w={width} h={height} {...cardProps}>
      <CardHeader onClick={onOpen}>
        <Heading size='sm'>{title}</Heading>
      </CardHeader>
      <CardBody px={2} py='0'>
        <ParentSize>{({ width, height }) => cloneElement(children, { width, height })}</ParentSize>
        <Modal size='xl' isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent w='80vw' maxW='80vw' h={{ base: "90vh", md: "60vh" }}>
            <ModalHeader>{title}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <ParentSize>{({ width, height }) => cloneElement(children, { width, height })}</ParentSize>
            </ModalBody>
            <ModalFooter></ModalFooter>
          </ModalContent>
        </Modal>
      </CardBody>
    </Card>
  );
};

export { PlotContainer };
