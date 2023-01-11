import { Spacer, HStack, Divider, Heading, Text, Checkbox, VStack } from "@chakra-ui/react";
import Image from "../image";
import InfoGroup, { Info } from "../infogroup";
import MotionPagination from "../motion/pagination";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setLoading } from "../../features/uiSlice";
import { client } from "../../utils/api/client";
import { parseData } from "../../utils/generic";
import { DataConfig, SpaProps } from "../../utils/interfaces";

interface ParticleProps extends SpaProps {
  /* Total number of available items */
  total: number;
  /* Page for parent motion correction, used if page match lock is set */
  page?: number;
}

const particleConfig: DataConfig = {
  include: [
    { name: "imageNumber" },
    { name: "numberOfParticles" },
    { name: "particleDiameter" },
    { name: "createdTimeStamp", label: "Movie Timestamp" },
  ],
};

const ParticlePicking = ({ autoProcId, total, page }: ParticleProps) => {
  const [innerPage, setInnerPage] = useState<number | undefined>();
  const [lockPage, setLockpage] = useState<boolean>(true);
  const [particleInfo, setParticleInfo] = useState<Info[] | null>(null);
  const [summaryImage, setSummaryImage] = useState("");

  const dispatch = useDispatch();

  useEffect(() => {
    if (lockPage) {
      if (page !== undefined && page > 0) {
        setInnerPage(page);
      } else {
        setInnerPage(total);
      }
    }
  }, [page, lockPage, total]);

  useEffect(() => {
    if (innerPage) {
      dispatch(setLoading(true));
      client
        .safe_get(`autoProc/${autoProcId}/particlePicker?page=${innerPage - 1}&limit=1`)
        .then((response) => {
          const data = response.data.items[0];
          if (data.particlePickerId) {
            setParticleInfo(parseData(data, particleConfig).info);
            client.safe_get(`autoProc/${autoProcId}/particlePicker/${data.particlePickerId}/image`).then((response) => {
              if (response.status === 200) {
                setSummaryImage(URL.createObjectURL(response.data));
              }
            });
          } else {
            setParticleInfo(null);
          }
        })
        .finally(() => dispatch(setLoading(false)));
    }
  }, [innerPage, autoProcId, dispatch]);

  return (
    <div>
      <HStack>
        <Heading variant='collection'>Particle Picking</Heading>
        <Spacer />
        <Checkbox
          aria-label='Lock Pages with Motion Correction'
          onChange={(e) => setLockpage(e.target.checked)}
          size='sm'
          defaultChecked
        >
          <Text verticalAlign='middle'>Match Selected Motion Correction Page</Text>
        </Checkbox>
        <MotionPagination
          disabled={lockPage}
          total={total}
          onChange={(page) => setInnerPage(page)}
          displayDefault={innerPage ? innerPage.toString() : undefined}
        />
      </HStack>
      <Divider />
      {particleInfo !== null ? (
        <HStack marginY={2}>
          <InfoGroup cols={1} info={particleInfo} />
          <Spacer />
          <Image src={summaryImage} title='Summary' width='30%' height='20vh' />
        </HStack>
      ) : (
        <VStack>
          <Heading paddingTop={10} variant='notFound'>
            No Particle Picking Data Found
          </Heading>
          <Heading variant='notFoundSubtitle'>This page does not contain any particle picking information.</Heading>
        </VStack>
      )}
    </div>
  );
};

export default ParticlePicking;
