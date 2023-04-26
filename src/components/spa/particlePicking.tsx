import { Spacer,  Divider, Heading, Checkbox, VStack, Grid, Skeleton, Stack } from "@chakra-ui/react";
import { ImageCard } from "components/visualisation/image";
import { InfoGroup } from "components/visualisation/infogroup";
import { MotionPagination } from "components/motion/pagination";
import { useCallback, useEffect, useState } from "react";
import { client, prependApiUrl } from "utils/api/client";
import { parseData } from "utils/generic";
import { components } from "schema/main";
import { DataConfig, SpaProps, Info, BoxPlotStats } from "schema/interfaces";
import { PlotContainer } from "components/visualisation/plotContainer";
import { Box } from "components/plots/box";
import { useQuery } from "@tanstack/react-query";

type ParticlePickingSchema = components["schemas"]["ParticlePicker"];

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

interface FullParticleData {
  particlePicker: Info[] | null;
  total: number | null;
  summary: string;
  iceThickness: BoxPlotStats[];
}

const convertToBoxPlot = (data: components["schemas"]["RelativeIceThickness"], label: string): BoxPlotStats => {
  return { min: data.minimum, max: data.maximum, median: data.median, q1: data.q1, q3: data.q3, label };
};

const fetchParticlePickingData = async (autoProcId: number, page: number) => {
  let data: FullParticleData = { particlePicker: null, total: null, summary: "", iceThickness: [] };
  const response = await client.safeGet(`autoProc/${autoProcId}/particlePicker?page=${page - 1}&limit=1`);

  if (response.status === 200 && response.data.items.length > 0) {
    const responseData = response.data.items[0] as ParticlePickingSchema;
    if (responseData.particlePickerId) {
      data = {
        iceThickness: [],
        particlePicker: parseData(responseData, particleConfig).info as Info[],
        total: response.data.total,
        summary: prependApiUrl(`autoProc/${autoProcId}/particlePicker/${responseData.particlePickerId}/image`),
      };

      const fileData = await client.safeGet(`movies/${responseData.movieId}/iceThickness?getAverages=true`);

      if (fileData.status === 200) {
        data.iceThickness = [
          convertToBoxPlot(fileData.data.current, "Current Image"),
          convertToBoxPlot(fileData.data.avg, "Average"),
        ];
      }
    }
  }

  return data;
};

const ParticlePicking = ({ autoProcId, total, page }: ParticleProps) => {
  const [innerPage, setInnerPage] = useState<number | undefined>(page);
  const [innerTotal, setInnerTotal] = useState(total);
  const [lockPage, setLockpage] = useState(true);

  useEffect(() => {
    if (lockPage) {
      setInnerPage(page !== undefined && page > 0 ? page : total);
    }
  }, [page, lockPage, total]);

  const { data, isLoading } = useQuery({
    queryKey: ["particlePicker", autoProcId, innerPage],
    queryFn: async () => await fetchParticlePickingData(autoProcId, innerPage!),
    enabled: !!innerPage,
  });

  useEffect(() => {
    if (lockPage) {
      setInnerTotal(total);
    } else {
      if (!data || !data.total) {
        return;
      }
      setInnerTotal(data.total);
    }
  }, [data, lockPage, total]);

  const handlePageChanged = useCallback((newPage: number) => setInnerPage(newPage), []);

  return (
    <div>
      <Stack direction={{base: "column", md: "row"}}>
        <Heading variant='collection'>Particle Picking</Heading>
        <Spacer />
        <Checkbox
          aria-label='Lock Pages with Motion Correction'
          onChange={(e) => setLockpage(e.target.checked)}
          size='sm'
          defaultChecked
        >
          Match Selected Motion Correction Page
        </Checkbox>
        <MotionPagination disabled={lockPage} total={innerTotal} onChange={handlePageChanged} page={innerPage} />
      </Stack>
      <Divider />
      {data && data.particlePicker ? (
        <Grid py={2} templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={2}>
          <InfoGroup cols={1} info={data.particlePicker} />
          <PlotContainer title='Relative Ice Thickness' height='25vh'>
            <Box data={data.iceThickness} options={{ y: { domain: { min: 120000, max: 160000 } } }} />
          </PlotContainer>
          <ImageCard h='25vh' src={data.summary} title='Summary' />
        </Grid>
      ) : isLoading ? (
        <Skeleton h='25vh' />
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

export { ParticlePicking };
