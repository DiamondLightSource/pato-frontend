import { Box, Text, Grid, GridItem, Skeleton } from "@chakra-ui/react";
import { Info } from "../../utils/interfaces";

interface InfoProps {
  info: Info[];
  /** Height of the information group component */
  height?: number | string;
  /** Number of columns to divide the information in */
  cols?: number;
  /** Vertical padding */
  py?: number;
}

const InfoGroup = ({ info, height = "100%", cols = 2, py = 0 }: InfoProps) => (
  <Box py={py} h={height} overflow='scroll'>
    {info.length < 1 && <Skeleton h='100%' />}
    <Grid templateColumns={`repeat(${cols}, minmax(0, 1fr))`} maxH='100%' gap={1}>
      {info.map((box: Info) => (
        <GridItem key={box.label} colSpan={box.wide ? cols : 1}>
          <Box h='100%' p={1} borderRadius={3} bg='diamond.100'>
            <Text aria-label={`${box.label}`} variant='infoGroupText' as='b'>{`${box.label}: `}</Text>
            <Text aria-label={`${box.label} Value`} variant='infoGroupText'>{`${box.value || "?"}`}</Text>
          </Box>
        </GridItem>
      ))}
    </Grid>
  </Box>
);

export { InfoGroup };
