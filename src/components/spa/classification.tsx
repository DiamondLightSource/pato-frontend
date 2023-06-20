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
import { useQuery } from "@tanstack/react-query";

type ClassificationSchema = components["schemas"]["Classification"];
interface FullClassification extends ClassificationSchema {
  imageUrl: string;
}

const getBorderColour = (selected?: boolean | null) => {
  switch (selected) {
    case false:
      return "red";
    case true:
      return "green";
    default:
      return "diamond.200";
  }
};

const sortValues = [
  { key: "particles", label: "Particles per Class" },
  { key: "class", label: "Class Distribution" },
  { key: "resolution", label: "Estimated Resolution" },
];

const fetchClassData = async (
  type: "2d" | "3d",
  autoProcId: number,
  sortType: SortTypes,
  excludeUnselected: boolean,
  page: number
) => {
  const response = await client.safeGet(
    `autoProc/${autoProcId}/classification?limit=8&page=${
      page - 1
    }&sortBy=${sortType}&classType=${type}&excludeUnselected=${excludeUnselected}`
  );

  if (response.status !== 200 || !response.data.items) {
    return { data: null, total: 0 };
  }

  let classes = response.data.items;
  if (type === "2d") {
    classes = classes.map((item: FullClassification) => ({
      ...item,
      imageUrl: prependApiUrl(
        `autoProc/${item.programId}/classification/${item.particleClassificationId}/image`
      ),
    }));
  }

  return { data: classes as FullClassification[], total: response.data.total as number };
};

const Classification = ({ autoProcId, type = "2d" }: ClassificationProps) => {
  const [pageAmount, setPageAmount] = useState(0);
  const [classPage, setClassPage] = useState(1);
  const [sortType, setSortType] = useState<SortTypes>("particles");
  const [selectedClass, setSelectedClass] = useState(0);
  const [excludeUnselected, setExcludeUnselected] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["classification", type, autoProcId, sortType, excludeUnselected, classPage],
    queryFn: async () =>
      await fetchClassData(type, autoProcId, sortType, excludeUnselected, classPage),
  });

  useEffect(() => {
    if (!isLoading) {
      setPageAmount(Math.ceil((data ? data.total : 0) / 8));
    }
  }, [data, isLoading]);

  const handle3dClassPageChange = useCallback((page: number) => {
    setClassPage(Math.floor((page - 1) / 8) + 1);
    setSelectedClass((page - 1) % 8);
  }, []);

  const classIndex = useMemo(
    () => (classPage - 1) * 8 + selectedClass + 1,
    [classPage, selectedClass]
  );

  const selectedClassInfo = useMemo(() => {
    if (data && data.data && data.data[selectedClass]) {
      return parseData(data.data[selectedClass], classificationConfig);
    }

    return {};
  }, [selectedClass, data]);

  return (
    <Box>
      <Stack direction={{ base: "column", md: "row" }} gap={2}>
        <HStack gap={5}>
          <Heading variant='collection'>{type.toUpperCase()} Classification</Heading>
          <Checkbox
            onChange={() => setExcludeUnselected(!excludeUnselected)}
            checked={excludeUnselected}
            size='sm'
          >
            Only Show Selected
          </Checkbox>
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
        <MotionPagination
          startFrom='start'
          page={classPage}
          onChange={setClassPage}
          total={pageAmount}
        />
      </Stack>
      <Divider />
      {isLoading ? (
        <Skeleton h='23vh' mb={1} />
      ) : data && data.data ? (
        <Grid
          pt='2'
          mb='3'
          templateColumns={{ base: "repeat(4, 1fr)", md: "repeat(8, 1fr)" }}
          gap='2'
        >
          {data.data.map((item, i) =>
            type === "2d" ? (
              <ImageCard
                borderColor={getBorderColour(item.selected)}
                h={{ base: "auto", md: "14vh" }}
                showModal={false}
                key={item.particleClassificationId}
                src={item.imageUrl}
                title={`${item.batchNumber}-${item.classNumber} (${item.particlesPerClass})`}
                active={selectedClass === i}
                onClick={() => setSelectedClass(i)}
              />
            ) : (
              <Card
                borderColor={getBorderColour(item.selected)}
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
        <Heading py='5vh' variant='notFound'>
          No Classes Found
        </Heading>
      )}
      {selectedClassInfo.info && (
        <InfoGroup height='auto' cols={5} info={selectedClassInfo.info as Info[]} />
      )}
      {data && type === "3d" && (
        <MolstarModal
          onChange={handle3dClassPageChange}
          autoProcId={autoProcId}
          page={classIndex}
          pageCount={data.total}
          classId={selectedClassInfo.particleClassificationId}
        />
      )}
    </Box>
  );
};

export { Classification };
