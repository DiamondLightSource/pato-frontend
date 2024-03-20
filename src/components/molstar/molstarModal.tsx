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
} from "@chakra-ui/react";
import { Suspense } from "react";
import React from "react";
import { MdOpenInNew } from "react-icons/md";
import { Flipper } from "@diamondlightsource/ui-components";
const MolstarWrapper = React.lazy(() => import("components/molstar/molstar"));

export interface MolstarModalProps {
  autoProcId: number;
  classId: number;
  page: number;
  pageCount: number;
  onChange?: (page: number) => void;
}

const MolstarModal = ({ autoProcId, classId, page, pageCount, onChange }: MolstarModalProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  return (
    <>
      <Button onClick={onOpen} width='30em'>
        Open 3D Visualisation <Spacer />
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
                <MolstarWrapper autoProcId={autoProcId} classId={classId}>
                  <Flipper size='md' total={pageCount} page={page} onChange={onChange} />
                </MolstarWrapper>
              </Suspense>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export { MolstarModal };
