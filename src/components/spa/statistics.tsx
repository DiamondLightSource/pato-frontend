import { useEffect, useState } from "react";
import { BarChart } from "../plots/bar";
import { PlotContainer } from "../visualisation/plotContainer";
import { BarStats } from "../../schema/interfaces";
import { client } from "../../utils/api/client";
import { Box, Divider, Grid, Heading, Skeleton } from "@chakra-ui/react";

interface SpaProps {
  /* Parent data collection ID*/
  dataCollectionId: number;
}

const Statistics = ({ dataCollectionId }: SpaProps) => {
  const [iceThickness, setIceThickness] = useState<BarStats[]>();

  useEffect(() => {
    client.safe_get(`dataCollections/${dataCollectionId}/iceThickness`).then((response) => {
      if (response.status === 200 && response.data.items) {
        const histogram: BarStats[] = [{ label: "<120", y: 0 }];
        for (const bin of response.data.items) {
          if (bin.x < 120000) {
            histogram[0].y += bin.y;
          } else {
            histogram.push({ label: (bin.x / 1000).toString(), y: bin.y });
          }
        }

        setIceThickness(histogram);
      }
    });
  }, [dataCollectionId]);

  return (
    <Box>
      <Heading variant='collection'>Ice Thickness</Heading>
      <Divider />
      {iceThickness ? (
        <Grid py={2} templateColumns='repeat(4, 1fr)' gap={2}>
          <PlotContainer title='Relative Ice Thickness' height='25vh'>
            <BarChart data={[iceThickness]} padding={0} options={{ x: { label: "10^3" } }} />
          </PlotContainer>
        </Grid>
      ) : (
        <Skeleton h='25vh' />
      )}
    </Box>
  );
};

export { Statistics };
