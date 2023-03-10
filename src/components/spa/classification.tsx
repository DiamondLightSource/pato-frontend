import {
  Spacer,
  HStack,
  Divider,
  Grid,
  Heading,
  Skeleton,
  Box,
  Select,
  Card,
  CardBody,
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
import { ImageCard } from "../visualisation/image";
import { InfoGroup } from "../visualisation/infogroup";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { client } from "../../utils/api/client";
import { MotionPagination } from "../motion/pagination";
import { components } from "../../schema/main";
import { parseData } from "../../utils/generic";
import { classificationConfig } from "../../utils/config/parse";
import { Info, ClassificationProps } from "../../schema/interfaces";
import React from "react";
import { MdOpenInNew } from "react-icons/md";
const MolstarWrapper = React.lazy(() => import("./molstar"));

type ClassificationSchema = components["schemas"]["Classification"];
interface FullClassification extends ClassificationSchema {
  imageUrl: string;
}

const sortValues = [
  { key: "particles", label: "Particles per Class" },
  { key: "class", label: "Class Distribution" },
  { key: "resolution", label: "Estimated Resolution" },
];

const Classification = ({ autoProcId, type = "2d" }: ClassificationProps) => {
  const { isOpen, onClose, onOpen } = useDisclosure();
  const [classificationData, setClassificationData] = useState<FullClassification[] | undefined | null>(undefined);
  const [pageAmount, setPageAmount] = useState(0);
  const [sortType, setSortType] = useState("particles");
  const [selectedClass, setSelectedClass] = useState(0);

  const getClassImage = useCallback(
    async (item: FullClassification) => {
      const newClass = { ...item, imageUrl: "" } as FullClassification;
      const response = await client.safe_get(
        `autoProc/${autoProcId}/classification/${item.particleClassificationId}/image`
      );

      if (response.status === 200) {
        newClass.imageUrl = URL.createObjectURL(response.data);
      }

      return newClass;
    },
    [autoProcId]
  );

  const handleClassificationChange = useCallback(
    (page: number) => {
      client
        .safe_get(`autoProc/${autoProcId}/classification?limit=8&page=${page - 1}&sortBy=${sortType}&classType=${type}`)
        .then(async (response) => {
          if (response.status === 200 && response.data.items) {
            setPageAmount(Math.ceil(response.data.total / 8));
            let classes = response.data.items;
            if (type === "2d") {
              classes = await Promise.all(
                classes.map(async (item: FullClassification) => {
                  return await getClassImage(item);
                })
              );
            }
            setClassificationData(classes);
          } else {
            setClassificationData(null);
          }
        });
    },
    [autoProcId, sortType, type, getClassImage]
  );

  useEffect(() => {
    handleClassificationChange(1);
  }, [handleClassificationChange]);

  const selectedClassInfo = useMemo(() => {
    if (classificationData && classificationData[selectedClass]) {
      return parseData(classificationData[selectedClass], classificationConfig);
    }

    return {};
  }, [selectedClass, classificationData]);

  return (
    <Box>
      <HStack>
        <Heading variant='collection'>{type.toUpperCase()} Classification</Heading>
        <Spacer />
        {classificationData !== null && (
          <>
            <Heading size='xs'>Sort by</Heading>
            <Select bg='white' onChange={(e) => setSortType(e.target.value)} size='xs' w='180px'>
              {sortValues.map((item) => (
                <option key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </Select>
            <MotionPagination startFrom='start' onChange={handleClassificationChange} total={pageAmount} />
          </>
        )}
      </HStack>
      <Divider />
      {classificationData ? (
        <Grid
          py={2}
          marginBottom={type === "2d" ? 6 : 0}
          templateColumns='repeat(8, 1fr)'
          h={type === "2d" ? "14vh" : "auto"}
          gap={2}
        >
          {classificationData.map((item, i) =>
            type === "2d" ? (
              <ImageCard
                height='14vh'
                showModal={false}
                key={item.particleClassificationId}
                src={item.imageUrl}
                title={`${item.batchNumber}-${item.classNumber} (${item.particlesPerClass})`}
                active={selectedClass === i}
                onClick={() => setSelectedClass(i)}
              />
            ) : (
              <Card
                data-testid={`class-${i}`}
                onClick={() => setSelectedClass(i)}
                key={i}
                aria-selected={selectedClass === i}
              >
                <CardBody py={2}>
                  <Heading size='sm'>
                    {item.batchNumber}-{item.classNumber} ({item.particlesPerClass})
                  </Heading>
                </CardBody>
              </Card>
            )
          )}
        </Grid>
      ) : classificationData === undefined ? (
        <Skeleton h='23vh' marginBottom={1} />
      ) : (
        <Heading h='14vh' paddingTop={10} variant='notFound'>
          No Classification Data Found
        </Heading>
      )}
      {selectedClassInfo.info && <InfoGroup height='auto' cols={5} info={selectedClassInfo.info as Info[]} />}
      {classificationData && type === "3d" && (
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
                    <MolstarWrapper
                      autoProcId={autoProcId}
                      classificationId={classificationData[selectedClass].particleClassificationId}
                    />
                  </Suspense>
                )}
              </ModalBody>
            </ModalContent>
          </Modal>
        </>
      )}
    </Box>
  );
};

export { Classification };
