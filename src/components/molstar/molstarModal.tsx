import {
  Spacer,
  HStack,
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
import { MotionPagination } from "components/motion/pagination";
import React from "react";
import { MdOpenInNew } from "react-icons/md";
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
      <HStack mt={2}>
        <Spacer />
        <Button w='30%' onClick={onOpen}>
          Open 3D Visualisation <Spacer />
          <Icon as={MdOpenInNew}></Icon>
        </Button>
      </HStack>
      <Modal size='2xl' isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent h='70%' minW={{ base: "95vh", md: "65vh" }}>
          <ModalHeader paddingBottom={0}>3D Visualisation</ModalHeader>
          <ModalCloseButton />
          <ModalBody h={{ base: "90vh", md: "60vh" }}>
            {isOpen && (
              <Suspense>
                <MolstarWrapper autoProcId={autoProcId} classId={classId}>
                  <MotionPagination size='md' total={pageCount} defaultPage={page} onChange={onChange} />
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
