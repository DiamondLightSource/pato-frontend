import {
  Spacer,
  HStack,
  Divider,
  Grid,
  Heading,
  Skeleton,
  Box,
  Select,
} from "@chakra-ui/react";
import Image from "./image";
import InfoGroup, { Info } from "./infogroup";
import { useCallback, useEffect, useState } from "react";
import { client } from "../utils/api/client";
import MotionPagination from "./motion/pagination";
import { components } from "../schema/main";
import { parseData } from "../utils/generic";
import { classificationConfig } from "../utils/parseConfig";

interface SpaProps {
  /* Parent autoprocessing program ID*/
  autoProcId: number;
}

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
  const [classificationData, setClassificationData] = useState<FullClassification[]>([]);
  const [pageAmount, setPageAmount] = useState(0);
  const [sortType, setSortType] = useState("particles");
  const [selectedClass, setSelectedClass] = useState(0);
  const [selectedClassInfo, setSelectedClassInfo] = useState<Record<string, any>>({});

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
      client
        .safe_get(`autoProc/${autoProcId}/classification?limit=8&page=${page - 1}&sortBy=${sortType}`)
        .then(async (response) => {
          setPageAmount(Math.ceil(response.data.total / 8));
          const classes = await Promise.all(
            response.data.items.map(async (item: FullClassification) => {
              return await getClassImage(item);
            })
          );
          setClassificationData(classes);
        });
    },
    [autoProcId, sortType, getClassImage]
  );

  useEffect(() => {
    handle2dClassificationChange(1);
  }, [handle2dClassificationChange]);

  useEffect(() => {
    if (classificationData[selectedClass]) {
      setSelectedClassInfo(parseData(classificationData[selectedClass], classificationConfig));
    }
  }, [selectedClass, classificationData]);

  return (
    <Box>
      <HStack>
        <Heading marginTop={3} variant='collection'>
          2D Classification
        </Heading>
        <Spacer />
        <Heading size='xs'>Sort by</Heading>
        <Select onChange={(e) => setSortType(e.target.value)} size='xs' w='180px'>
          {sortValues.map((item) => (
            <option key={item.key} value={item.key}>
              {item.label}
            </option>
          ))}
        </Select>
        <MotionPagination startFrom='start' onChange={handle2dClassificationChange} total={pageAmount} />
      </HStack>
      <Divider />
      {classificationData.length ? (
        <Grid py={2} marginBottom={6} templateColumns='repeat(8, 1fr)' h='14vh' gap={2}>
          {classificationData.map((item, i) => (
            <Image
              height='14vh'
              showModal={false}
              key={item.particleClassificationId}
              src={item.imageUrl}
              title={`${item.batchNumber}-${item.classNumber} (${item.particlesPerClass})`}
              active={selectedClass === i}
              onClick={() => setSelectedClass(i)}
            ></Image>
          ))}
        </Grid>
      ) : (
        <Skeleton h='14vh' marginBottom={1} />
      )}
      {selectedClassInfo.info ? <InfoGroup cols={5} info={selectedClassInfo.info as Info[]} /> : <Skeleton h='9vh' />}
    </Box>
  );
};

export default Class2d;
