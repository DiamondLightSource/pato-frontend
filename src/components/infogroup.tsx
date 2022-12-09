import { Box, Text, Grid, GridItem, Skeleton } from "@chakra-ui/react";

export interface Info {
  /** Label/description (title) for a display value */
  label: string;
  /** Value to accompany label */
  value?: string;
  /** Whether or not the given information element should span all columns */
  wide?: boolean;
}

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
            <Text variant='infoGroupText' as='b'>{`${box.label}: `}</Text>
            <Text variant='infoGroupText'>{`${box.value || "?"}`}</Text>
          </Box>
        </GridItem>
      ))}
    </Grid>
  </Box>
);

export default InfoGroup;
