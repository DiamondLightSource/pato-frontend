import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  HStack,
  Spacer,
  Image,
  Heading,
  VStack,
} from "@chakra-ui/react";
import { Flipper, APNGViewer } from "@diamondlightsource/ui-components";
import APNGContainer from "components/visualisation/apngContainer";
import { Suspense, useMemo } from "react";
import { TomogramMovieTypes } from "schema/interfaces";
import { prependApiUrl } from "utils/api/client";
import { capitalise } from "utils/generic";

export interface SliceViewerProps {
  onClose: () => void;
  isOpen?: boolean;
  total: number;
  page: number;
  onPageChange: (page: number) => void;
  movieType: TomogramMovieTypes;
  tomogramId: number;
}

export const SliceViewer = ({
  onClose,
  total,
  page,
  onPageChange,
  movieType,
  tomogramId,
  isOpen = false,
}: SliceViewerProps) => {
  const tomogramMovieSrc = useMemo(
    () => prependApiUrl(`tomograms/${tomogramId}/movie`),
    [tomogramId]
  );

  if (!isOpen) {
    return null;
  }

  return (
    <Modal size='6xl' isOpen onClose={onClose}>
      <ModalOverlay />
      <ModalContent minW={{ base: "95vh", md: "65vh" }}>
        <ModalHeader paddingBottom={0}>Movie</ModalHeader>
        <ModalCloseButton />
        <ModalBody h={{ base: "90vh", md: "60vh" }}>
          <HStack>
            <Spacer />
            <Flipper
              size='md'
              onChangeEnd={onPageChange}
              defaultPage={page}
              total={total}
              w='5em'
            />
          </HStack>
          <Suspense>
            {movieType === "alignment" ? (
              <APNGContainer>
                <VStack h='100%' w='100%' spacing='0' bg='diamond.100'>
                  <Image
                    h='100%'
                    alt='Stack'
                    src={prependApiUrl(
                      `tomograms/${tomogramId}/centralSlice?movieType=${movieType}`
                    )}
                    fallbackSrc='/images/no-image.png'
                    objectFit='contain'
                  />
                  <Heading py={2} textAlign='center' w='100%' bg='diamond.75' size='sm'>
                    Alignment
                  </Heading>
                </VStack>
                <APNGViewer caption='Stack' src={`${tomogramMovieSrc}?movieType=stack`} />
              </APNGContainer>
            ) : (
              <APNGContainer>
                <APNGViewer
                  caption={capitalise(movieType)}
                  src={`${tomogramMovieSrc}?movieType=${movieType}`}
                />
                <APNGViewer caption='Not Denoised' src={tomogramMovieSrc} />
              </APNGContainer>
            )}
          </Suspense>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
