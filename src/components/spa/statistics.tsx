import { useEffect, useState } from "react";
import { BarChart } from "components/plots/bar";
import { PlotContainer } from "components/visualisation/plotContainer";
import { BarStats } from "schema/interfaces";
import { Box, Divider, Grid, Heading, Skeleton } from "@chakra-ui/react";
import { setHistogram } from "utils/api/response";

interface SpaProps {
  /* Parent data collection ID*/
  dataCollectionId: number;
}

const Statistics = ({ dataCollectionId }: SpaProps) => {
  const [iceThickness, setIceThickness] = useState<BarStats[] | null>();
  const [totalMotion, setTotalMotion] = useState<BarStats[] | null>();
  const [resolution, setResolution] = useState<BarStats[] | null>();
  const [particleCount, setParticleCount] = useState<BarStats[] | null>();

  useEffect(() => {
    const endpointPrefix = `dataCollections/${dataCollectionId}`;
    setHistogram(`${endpointPrefix}/totalMotion?dataBin=10&minimum=10`, setTotalMotion, 10);
    setHistogram(`${endpointPrefix}/iceThickness?dataBin=10000&minimum=100000`, setIceThickness, 10000);
    setHistogram(`${endpointPrefix}/resolution?dataBin=2&minimum=0`, setResolution, 1);
    setHistogram(`${endpointPrefix}/particles?dataBin=70&minimum=10`, setParticleCount, 10);
  }, [dataCollectionId]);

  return (
    <Box>
      <Heading variant='collection'>Frequency</Heading>
      <Divider />
      {iceThickness && totalMotion && resolution && particleCount ? (
        <Grid py={2} templateColumns={{base: "", md: 'repeat(4, 1fr)'}} gap={2}>
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
        <Heading py="7vh" variant='notFound'>
          No Frequency Data Available
        </Heading>
      ) : (
        <Skeleton h='25vh' />
      )}
    </Box>
  );
};

export default Statistics;
