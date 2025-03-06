import {
  Spacer,
  Divider,
  Heading,
  Checkbox,
  Text,
  VStack,
  Grid,
  Skeleton,
  Stack,
  GridItem,
  HStack,
  Tag,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { client, prependApiUrl } from "utils/api/client";
import { parseData } from "utils/generic";
import { components } from "schema/main";
import { DataConfig, SpaProps } from "schema/interfaces";
import { PlotContainer } from "components/visualisation/plotContainer";
import { useQuery } from "@tanstack/react-query";
import {
  Flipper,
  BoxPlot,
  InfoGroup,
  ImageCard,
  Info,
  BoxPlotStats,
} from "@diamondlightsource/ui-components";

type ParticlePickingSchema = components["schemas"]["ParticlePicker"];

export interface ParticleProps extends SpaProps {
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
  iceThickness: { data: BoxPlotStats[]; domain: { min: number; max: number } };
}

const convertToBoxPlot = (
  data: components["schemas"]["RelativeIceThickness"],
  label: string
): BoxPlotStats => ({
  min: data.minimum / 1000,
  max: data.maximum / 1000,
  median: data.median / 1000,
  q1: data.q1 / 1000,
  q3: data.q3 / 1000,
  label,
});

const fetchParticlePickingData = async (autoProcId: number, page: number) => {
  const baseDomain = { min: 120, max: 160 };

  let data: FullParticleData = {
    particlePicker: null,
    total: null,
    summary: "",
    iceThickness: { data: [], domain: baseDomain },
  };
  const response = await client.safeGet(
    `autoProc/${autoProcId}/particlePicker?page=${page - 1}&limit=1`
  );

  if (response.status === 200 && response.data.items.length > 0) {
    const responseData = response.data.items[0] as ParticlePickingSchema;
    if (responseData.particlePickerId) {
      data = {
        iceThickness: { data: [], domain: baseDomain },
        particlePicker: parseData(responseData, particleConfig).info as Info[],
        total: response.data.total,
        summary: prependApiUrl(
          `autoProc/${autoProcId}/particlePicker/${responseData.particlePickerId}/image`
        ),
      };

      const fileData = await client.safeGet(
        `movies/${responseData.movieId}/iceThickness?getAverages=true`
      );

      if (fileData.status === 200) {
        const boundary = Math.round(fileData.data.avg.stddev / 1000);

        // 'Mean' as in the mean of all medians
        const mean = Math.round(fileData.data.avg.median / 1000);

        const minDomain = mean - boundary > 1 ? mean - boundary : 1;
        const maxDomain = mean + boundary > 1 ? mean + boundary : 1;

        data.iceThickness = {
          data: [
            convertToBoxPlot(fileData.data.current, "Current Image"),
            convertToBoxPlot(fileData.data.avg, "Average"),
          ],
          domain: { min: minDomain, max: maxDomain },
        };
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
      <Stack direction={{ base: "column", md: "row" }}>
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
        <Flipper
          disabled={lockPage}
          total={innerTotal}
          onChange={handlePageChanged}
          page={innerPage}
          w='5em'
        />
      </Stack>
      <Divider />
      {data && data.particlePicker ? (
        <Grid py={2} templateColumns={{ base: "repeat(1, 1fr)", md: "repeat(3, 1fr)" }} gap={2}>
          <InfoGroup cols={1} info={data.particlePicker} />
          <PlotContainer title='Relative Ice Thickness' height='25vh'>
            <BoxPlot
              data={data.iceThickness.data}
              options={{
                y: {
                  domain: data.iceThickness.domain,
                  label: "Thickest → Thinnest",
                  log: true,
                  base: Math.E,
                  precision: 1,
                },
              }}
            />
          </PlotContainer>
          <GridItem>
            <ImageCard h='25vh' src={data.summary} title='Summary' />
            <HStack py='0.5em' px='0.5em' bg='diamond.100'>
              <Text flex='1 0 0'>
                <Tag size='sm' bg='#008000'></Tag> Selected
              </Text>
              <Text flex='1 0 0'>
                <Tag size='sm' bg='#FF7F00'></Tag> Not Selected
              </Text>
            </HStack>
          </GridItem>
        </Grid>
      ) : isLoading ? (
        <Skeleton h='25vh' />
      ) : (
        <VStack>
          <Heading paddingTop={10} variant='notFound'>
            No Particle Picking Data Found
          </Heading>
          <Heading variant='notFoundSubtitle'>
            This page does not contain any particle picking information.
          </Heading>
        </VStack>
      )}
    </div>
  );
};

export { ParticlePicking };
