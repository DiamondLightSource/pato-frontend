import { useEffect, useState } from "react";
import { PlotContainer } from "components/visualisation/plotContainer";
import { Box, Divider, Grid, Heading, Skeleton } from "@chakra-ui/react";
import { setHistogram } from "utils/api/response";
import { BarChart, BarStats, BasePoint, ScatterPlot } from "@diamondlightsource/ui-components";
import { client } from "utils/api/client";

interface SpaProps {
  /* Parent data collection ID*/
  dataCollectionId: number;
}

const Statistics = ({ dataCollectionId }: SpaProps) => {
  const [iceThickness, setIceThickness] = useState<BarStats[] | null>();
  const [totalMotion, setTotalMotion] = useState<BarStats[] | null>();
  const [resolution, setResolution] = useState<BarStats[] | null>();
  const [particleCount, setParticleCount] = useState<BarStats[] | null>();
  const [ctfData, setCtfData] = useState<{
    defocus: BasePoint[];
    resolution: BarStats[][];
  } | null>();

  useEffect(() => {
    const endpointPrefix = `dataCollections/${dataCollectionId}`;
    setHistogram(`${endpointPrefix}/totalMotion?dataBin=10&minimum=10`, setTotalMotion, 10);
    setHistogram(
      `${endpointPrefix}/iceThickness?dataBin=10000&minimum=100000`,
      setIceThickness,
      10000
    );
    setHistogram(`${endpointPrefix}/resolution?dataBin=2&minimum=2`, setResolution, 1);
    setHistogram(`${endpointPrefix}/particles?dataBin=70&minimum=10`, setParticleCount, 10);

    Promise.all([
      client.safeGet(`dataCollections/${dataCollectionId}/ctf`),
      client.safeGet(`dataCollections/${dataCollectionId}/particleCountPerResolution`),
    ]).then(async ([resDefocus, resResolution]) => {
      if (resDefocus.status === 200 && resResolution.status === 200) {
        const barData = resResolution.data.items.map((v: BasePoint) => ({
          label: v.x,
          y: v.y / 1000,
        }));
        setCtfData({ defocus: resDefocus.data.items, resolution: [barData] });
      } else {
        setCtfData(null);
      }
    });
  }, [dataCollectionId]);

  return (
    <Box>
      <Heading variant='collection'>Frequency</Heading>
      <Divider />
      {iceThickness && totalMotion && resolution && particleCount ? (
        <Grid py={2} templateColumns={{ base: "", md: "repeat(4, 1fr)" }} gap={2}>
          <PlotContainer title='Relative Ice Thickness' h='25vh'>
            <BarChart data={[iceThickness]} padding={0} options={{ x: { label: "10^4" } }} />
          </PlotContainer>
          <PlotContainer title='Total Motion' h='25vh'>
            <BarChart data={[totalMotion]} padding={0} options={{ x: { label: "10^1" } }} />
          </PlotContainer>
          <PlotContainer title='Estimated Resolution' h='25vh'>
            <BarChart data={[resolution]} padding={0} />
          </PlotContainer>
          <PlotContainer title='Particle Count' h='25vh'>
            <BarChart data={[particleCount]} padding={0} options={{ x: { label: "10^1" } }} />
          </PlotContainer>
        </Grid>
      ) : [iceThickness, totalMotion, resolution, particleCount].some((i) => i === null) ? (
        <Heading py='7vh' variant='notFound'>
          No Frequency Data Available
        </Heading>
      ) : (
        <Skeleton h='25vh' />
      )}
      <Heading variant='collection'>CTF</Heading>
      <Divider />
      {ctfData ? (
        <Grid py={2} templateColumns={{ base: "", md: "repeat(2, 1fr)" }} gap={2}>
          <PlotContainer title='Particle Count/Defocus' h='25vh'>
            <ScatterPlot
              data={ctfData.defocus}
              options={{ x: { label: "Defocus (μm)" }, y: { label: "Particle Count" } }}
            />
          </PlotContainer>
          <PlotContainer title='Particle Count/Resolution' h='25vh'>
            <BarChart
              data={ctfData.resolution}
              options={{ x: { label: "Resolution (Å)" }, y: { label: "Particle Count (10^3)" } }}
            />
          </PlotContainer>
        </Grid>
      ) : ctfData === null ? (
        <Heading py='7vh' variant='notFound'>
          No CTF Data Available
        </Heading>
      ) : (
        <Skeleton h='25vh' />
      )}
    </Box>
  );
};

export default Statistics;
