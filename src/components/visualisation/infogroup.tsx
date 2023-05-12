import { Box, Text, Grid, GridItem, Skeleton } from "@chakra-ui/react";
import { Info } from "schema/interfaces";

export interface InfoProps {
  info: Info[];
  /** Height of the information group component */
  height?: number | string;
  /** Number of columns to divide the information in */
  cols?: number;
}

const InfoGroup = ({ info, height = "100%", cols = 2 }: InfoProps) => (
  <Box py='0' h={height} overflowY='auto'>
    {info.length < 1 ? (
      <Skeleton h='100%' />
    ) : (
      <Grid templateColumns={`repeat(${cols}, minmax(0, 1fr))`} maxH='100%' gap={1}>
        {info.map((box: Info) => (
          <GridItem key={box.label} colSpan={box.wide ? cols : 1}>
            <Box borderLeft='2px solid' borderColor='diamond.200' h='100%' p={1} borderRadius={3} bg='diamond.100'>
              <Text variant='infoGroupText' as='b'>{`${box.label}: `}</Text>
              <Text aria-label={`${box.label} Value`} variant='infoGroupText'>{`${box.value || "?"}`}</Text>
            </Box>
          </GridItem>
        ))}
      </Grid>
    )}
  </Box>
);

export { InfoGroup };
