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
  Checkbox,
  Stack,
} from "@chakra-ui/react";
import { ImageCard } from "components/visualisation/image";
import { InfoGroup } from "components/visualisation/infogroup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { client, prependApiUrl } from "utils/api/client";
import { MotionPagination } from "components/motion/pagination";
import { components } from "schema/main";
import { parseData } from "utils/generic";
import { classificationConfig } from "utils/config/parse";
import { Info, ClassificationProps, SortTypes } from "schema/interfaces";
import { MolstarModal } from "components/molstar/molstarModal";

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
  const [classificationData, setClassificationData] = useState<FullClassification[] | undefined | null>(undefined);
  const [classCount, setClassCount] = useState(0);
  const [classPage, setClassPage] = useState(0);
  const [sortType, setSortType] = useState<SortTypes>("particles");
  const [selectedClass, setSelectedClass] = useState(0);

  const handleClassificationChange = useCallback(
    (page: number) => {
      setClassPage(page);
      client
        .safeGet(`autoProc/${autoProcId}/classification?limit=8&page=${page - 1}&sortBy=${sortType}&classType=${type}`)
        .then(async (response) => {
          if (response.status === 200 && response.data.items) {
            setClassCount(response.data.total);
            let classes = response.data.items;
            if (type === "2d") {
              classes = classes.map((item: FullClassification) => ({
                ...item,
                imageUrl: prependApiUrl(
                  `autoProc/${item.programId}/classification/${item.particleClassificationId}/image`
                ),
              }));
            }
            setClassificationData(classes);
          } else {
            setClassificationData(null);
          }
        });
    },
    [autoProcId, sortType, type]
  );

  const pageAmount = useMemo(() => Math.ceil(classCount / 8), [classCount]);

  const handle3dClassPageChange = useCallback((page: number) => {
    setClassPage(Math.floor((page - 1) / 8) + 1);
    setSelectedClass((page - 1) % 8);
  }, []);

  const classIndex = useMemo(() => {
    return (classPage - 1) * 8 + selectedClass + 1;
  }, [classPage, selectedClass]);

  useEffect(() => {
    handleClassificationChange(1);
  }, [handleClassificationChange]);

  const selectedClassInfo = useMemo(() => {
    if (classificationData && classificationData[selectedClass]) {
      return parseData(classificationData[selectedClass], classificationConfig);
    }

    return {};
  }, [selectedClass, classificationData]);

  if (classificationData === null) {
    return null;
  }

  return (
    <Box>
      <Stack direction={{ base: "column", md: "row" }} gap={2}>
        <HStack gap={5}>
          <Heading variant='collection'>{type.toUpperCase()} Classification</Heading>
          <Checkbox size='sm'>Only Show Selected</Checkbox>
        </HStack>
        <Spacer display={{ base: "none", md: "inline-block" }} />
        <HStack gap={3}>
          <Heading id='sortLabel' size='xs'>
            Sort by
          </Heading>
          <Select
            aria-labelledby='sortlabel'
            bg='white'
            onChange={(e) => setSortType(e.target.value as SortTypes)}
            size='xs'
            w='180px'
          >
            {sortValues.map((item) => (
              <option key={item.key} value={item.key}>
                {item.label}
              </option>
            ))}
          </Select>
        </HStack>
        <MotionPagination startFrom='start' page={classPage} onChange={handleClassificationChange} total={pageAmount} />
      </Stack>
      <Divider />
      {classificationData !== undefined ? (
        <Grid
          pt="2"
          mb="3"
          templateColumns={{base: 'repeat(4, 1fr)', md: 'repeat(8, 1fr)'}}
          gap="2"
        >
          {classificationData.map((item, i) =>
            type === "2d" ? (
              <ImageCard
                borderColor='green'
                h={{base: 'auto', md: '14vh'}}
                showModal={false}
                key={item.particleClassificationId}
                src={item.imageUrl}
                title={`${item.batchNumber}-${item.classNumber} (${item.particlesPerClass})`}
                active={selectedClass === i}
                onClick={() => setSelectedClass(i)}
              />
            ) : (
              <Card
                borderColor='green'
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
      ) : (
        <Skeleton h='23vh' mb={1} />
      )}
      {selectedClassInfo.info && <InfoGroup height='auto' cols={5} info={selectedClassInfo.info as Info[]} />}
      {classificationData && type === "3d" && (
        <MolstarModal
          onChange={handle3dClassPageChange}
          autoProcId={autoProcId}
          page={classIndex}
          pageCount={classCount}
          classId={selectedClassInfo.particleClassificationId}
        />
      )}
    </Box>
  );
};

export { Classification };
