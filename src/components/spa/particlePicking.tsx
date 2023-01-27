import { Spacer, HStack, Divider, Heading, Text, Checkbox, VStack, Grid, Skeleton } from "@chakra-ui/react";
import { ImageCard } from "../visualisation/image";
import { InfoGroup } from "../visualisation/infogroup";
import { MotionPagination } from "../motion/pagination";
import { useEffect, useState } from "react";
import { client } from "../../utils/api/client";
import { parseData } from "../../utils/generic";
import { components } from "../../schema/main";
import { DataConfig, SpaProps, Info, BoxPlotStats } from "../../schema/interfaces";
import { PlotContainer } from "../visualisation/plotContainer";
import { Box } from "../plots/box";

type ParticlePickingSchema = components["schemas"]["ParticlePicker"];
type IceThickness = components["schemas"]["IceThicknessWithAverage"];

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

const convertToBoxPlot = (data: components["schemas"]["RelativeIceThickness"], label: string): BoxPlotStats => {
  return { min: data.minimum, max: data.maximum, median: data.median, q1: data.q1, q3: data.q3, label };
};

const ParticlePicking = ({ autoProcId, total, page }: ParticleProps) => {
  const [innerPage, setInnerPage] = useState<number | undefined>();
  const [lockPage, setLockpage] = useState<boolean>(true);
  const [particleInfo, setParticleInfo] = useState<Info[] | null | undefined>();
  const [summaryImage, setSummaryImage] = useState("");
  const [iceThickness, setIceThickness] = useState<BoxPlotStats[]>();

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
      client.safe_get(`autoProc/${autoProcId}/particlePicker?page=${innerPage - 1}&limit=1`).then((response) => {
        if (response.status === 200) {
          const data = response.data.items[0] as ParticlePickingSchema;
          if (data.particlePickerId) {
            setParticleInfo(parseData(data, particleConfig).info);
            client.safe_get(`autoProc/${autoProcId}/particlePicker/${data.particlePickerId}/image`).then((response) => {
              if (response.status === 200) {
                setSummaryImage(URL.createObjectURL(response.data));
              }
            });

            client.safe_get(`movies/${data.movieId}/iceThickness?getAverages=true`).then((response) => {
              if (response.status === 200) {
                const data = response.data as IceThickness;

                setIceThickness([
                  convertToBoxPlot(data.current, "Current Image"),
                  convertToBoxPlot(data.avg, "Average"),
                ]);
              }
            });
          }
        } else {
          setParticleInfo(null);
        }
      });
    }
  }, [innerPage, autoProcId]);

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
      {particleInfo ? (
        <Grid py={2} marginBottom={6} templateColumns='repeat(3, 1fr)' h='25vh' gap={2}>
          <InfoGroup cols={1} info={particleInfo} />
          {iceThickness !== undefined ? (
            <PlotContainer title='Relative Ice Thickness' height='25vh'>
              <Box data={iceThickness} options={{ y: { domain: { min: 120000, max: 160000 } } }} />
            </PlotContainer>
          ) : (
            <Skeleton h='25vh' />
          )}
          <ImageCard src={summaryImage} title='Summary' />
        </Grid>
      ) : (
        <>
          {particleInfo === null ? (
            <VStack>
              <Heading paddingTop={10} variant='notFound'>
                No Particle Picking Data Found
              </Heading>
              <Heading variant='notFoundSubtitle'>This page does not contain any particle picking information.</Heading>
            </VStack>
          ) : (
            <Skeleton h='25vh' />
          )}
        </>
      )}
    </div>
  );
};

export { ParticlePicking };
