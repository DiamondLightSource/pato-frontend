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
  VStack,
  Heading,
  Icon,
  Skeleton,
} from "@chakra-ui/react";
import { Suspense, useCallback, useEffect, useState } from "react";
import { client } from "../../utils/api/client";
import { MotionPagination } from "../motion/pagination";
import { components } from "../../schema/main";
import React from "react";
import { MdOpenInNew } from "react-icons/md";
import { SortTypes } from "../../schema/interfaces";
const MolstarWrapper = React.lazy(() => import("./molstar"));

type ClassificationSchema = components["schemas"]["Classification"];

export interface MolstarModalProps {
  autoProcId: number;
  defaultIndex: number;
  defaultSort: SortTypes;
  onChange?: (page: number) => void;
}

const MolstarModal = ({ autoProcId, defaultIndex, defaultSort, onChange }: MolstarModalProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();

  const [page, setPage] = useState(defaultIndex);
  const [pageAmount, setPageAmount] = useState(1);
  const [classId, setClassId] = useState<number | null>();

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    client
      .safe_get(`autoProc/${autoProcId}/classification?limit=1&page=${page}&sortBy=${defaultSort}&classType=3d`)
      .then(async (response) => {
        if (response.status === 200 && response.data.items) {
          const selectedClass = response.data.items[0] as ClassificationSchema;
          setPageAmount(response.data.total);
          setClassId(selectedClass.particleClassificationId);
        } else {
          setClassId(null);
        }
      });
  }, [autoProcId, defaultSort, isOpen, page]);

  useEffect(() => {
    setPage(defaultIndex);
  }, [defaultIndex]);

  const handlePageChanged = useCallback(
    (newPage: number) => {
      if (onChange) {
        onChange(newPage);
      }

      setPage(newPage);
    },
    [onChange]
  );

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
            {isOpen && classId ? (
              <Suspense>
                <MolstarWrapper autoProcId={autoProcId} classificationId={classId}>
                  <MotionPagination size='md' total={pageAmount} defaultPage={page} onChange={handlePageChanged} />
                </MolstarWrapper>
              </Suspense>
            ) : classId === null ? (
              <VStack w='100%' h='100%' bg='diamond.75'>
                <Heading m='auto' variant='notFound'>
                  No Classification Data
                </Heading>
              </VStack>
            ) : <Skeleton h="60vh"></Skeleton>}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export { MolstarModal };
