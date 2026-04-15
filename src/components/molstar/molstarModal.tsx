import {
  Spacer,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  Button,
  Icon,
  ButtonProps,
} from "@chakra-ui/react";
import { Suspense } from "react";
import React from "react";
import { MdOpenInNew } from "react-icons/md";
import { Flipper } from "@diamondlightsource/ui-components";
const MolstarTomogramWrapper = React.lazy(() => import("components/molstar/MolstarTomogram"));
const MolstarWrapper = React.lazy(() => import("components/molstar/molstar"));

export interface MolstarModalProps extends Omit<ButtonProps, "onChange"> {
  autoProcId?: number;
  classId?: number;
  page?: number;
  pageCount?: number;
  onChange?: (page: number) => void;
  buttonText?: string;
  tomogramId?: number;
  buttonWidth?: string;
}

const MolstarModal = ({
  autoProcId,
  classId,
  page,
  pageCount,
  onChange,
  buttonText = "Open 3D Visualisation",
  tomogramId,
  buttonWidth = "30em",
  ...props
}: MolstarModalProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const MolstarRenderer = autoProcId && classId ? MolstarWrapper : MolstarTomogramWrapper;
  const molstarProps = { autoProcId, classId, tomogramId };

  if (!autoProcId && !classId && !tomogramId) {
    console.error("No valid item ID provided for Molstar renderer");
    return null;
  }

  return (
    <>
      <Button onClick={onOpen} width={buttonWidth} {...props}>
        {buttonText}
        <Spacer />
        <Icon as={MdOpenInNew}></Icon>
      </Button>
      <Modal size='2xl' isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent h='70%' minW={{ base: "95vh", md: "65vh" }}>
          <ModalHeader paddingBottom={0}>3D Visualisation</ModalHeader>
          <ModalCloseButton />
          <ModalBody h={{ base: "90vh", md: "60vh" }}>
            {isOpen && (
              <Suspense>
                {/* @ts-ignore The appropriate renderer is selected and ensures the values aren't null , this does look ugly though */}
                <MolstarRenderer {...molstarProps}>
                  {pageCount && (
                    <Flipper size='md' total={pageCount} page={page} onChange={onChange} w='5em' />
                  )}
                </MolstarRenderer>
              </Suspense>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export { MolstarModal };
