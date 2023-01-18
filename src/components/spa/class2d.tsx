import { Spacer, HStack, Divider, Grid, Heading, Skeleton, Box, Select, VStack } from "@chakra-ui/react";
import { ImageCard } from "../visualisation/image";
import { InfoGroup } from "../visualisation/infogroup";
import { useCallback, useEffect, useMemo, useState } from "react";
import { client } from "../../utils/api/client";
import { MotionPagination } from "../motion/pagination";
import { components } from "../../schema/main";
import { parseData } from "../../utils/generic";
import { classificationConfig } from "../../utils/config/parse";
import { setLoading } from "../../features/uiSlice";
import { useAppDispatch } from "../../store/hooks";
import { SpaProps, Info } from "../../utils/interfaces";

type Classification2D = components["schemas"]["Classification2D"];
interface FullClassification extends Classification2D {
  imageUrl: string;
}

const sortValues = [
  { key: "particles", label: "Particles per Class" },
  { key: "class", label: "Class Distribution" },
  { key: "resolution", label: "Estimated Resolution" },
];

const Class2d = ({ autoProcId }: SpaProps) => {
  const [classificationData, setClassificationData] = useState<FullClassification[] | undefined | null>(undefined);
  const [pageAmount, setPageAmount] = useState(0);
  const [sortType, setSortType] = useState("particles");
  const [selectedClass, setSelectedClass] = useState(0);

  const dispatch = useAppDispatch();

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

  const handle2dClassificationChange = useCallback(
    (page: number) => {
      dispatch(setLoading(true));
      client
        .safe_get(`autoProc/${autoProcId}/classification?limit=8&page=${page - 1}&sortBy=${sortType}`)
        .then(async (response) => {
          if (response.status === 200 && response.data.items) {
            setPageAmount(Math.ceil(response.data.total / 8));
            const classes = await Promise.all(
              response.data.items.map(async (item: FullClassification) => {
                return await getClassImage(item);
              })
            );
            setClassificationData(classes);
          } else {
            setClassificationData(null);
          }
        })
        .finally(() => dispatch(setLoading(false)));
    },
    [autoProcId, sortType, getClassImage, dispatch]
  );

  useEffect(() => {
    handle2dClassificationChange(1);
  }, [handle2dClassificationChange]);

  const selectedClassInfo = useMemo(() => {
    if (classificationData && classificationData[selectedClass]) {
      return parseData(classificationData[selectedClass], classificationConfig);
    }

    return {};
  }, [selectedClass, classificationData]);

  return (
    <Box>
      <HStack>
        <Heading marginTop={3} variant='collection'>
          2D Classification
        </Heading>
        <Spacer />
        <Heading size='xs'>Sort by</Heading>
        <Select bg='diamond.50' onChange={(e) => setSortType(e.target.value)} size='xs' w='180px'>
          {sortValues.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </Select>
        <MotionPagination startFrom='start' onChange={handle2dClassificationChange} total={pageAmount} />
      </HStack>
      <Divider />
      {classificationData ? (
        <Grid py={2} marginBottom={6} templateColumns='repeat(8, 1fr)' h='14vh' gap={2}>
          {classificationData.map((item, i) => (
            <ImageCard
              height='14vh'
              showModal={false}
              key={item.particleClassificationId}
              src={item.imageUrl}
              title={`${item.batchNumber}-${item.classNumber} (${item.particlesPerClass})`}
              active={selectedClass === i}
              onClick={() => setSelectedClass(i)}
            />
          ))}
        </Grid>
      ) : (
        <>
          {classificationData === undefined ? (
            <Skeleton h='23vh' marginBottom={1} />
          ) : (
            <VStack>
              <Heading paddingTop={10} variant='notFound'>
                No 2D Classification Data Found
              </Heading>
              <Heading variant='notFoundSubtitle'>
                This page does not contain any 2D classification information.
              </Heading>
            </VStack>
          )}
        </>
      )}
      {selectedClassInfo.info && <InfoGroup cols={5} info={selectedClassInfo.info as Info[]} />}
    </Box>
  );
};

export { Class2d };
