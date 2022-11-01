import { Box, Text, Grid, GridItem, Skeleton } from "@chakra-ui/react";
import { FunctionComponent } from "react";

export interface Info {
  label: string;
  value?: string;
  wide?: boolean;
}

interface InfoProp {
  info: Info[];
  height?: number | string;
  cols?: number;
  py?: number;
}

const InfoGroup: FunctionComponent<InfoProp> = ({ info, height = "100%", cols = 2, py = 0 }): JSX.Element => (
  <Box py={py} h={height} overflow='scroll'>
    {info.length < 1 && <Skeleton h='100%' />}
    <Grid templateColumns={`repeat(${cols}, minmax(0, 1fr))`} h='100%' gap={1}>
      {info.map((box: Info) => {
        return (
          <GridItem key={box.label} colSpan={box.wide ? cols : 1}>
            <Box h='100%' p={1} borderRadius={3} bg='diamond.100'>
              <Text variant='infoGroupText' as='b'>{`${box.label}: `}</Text>
              <Text variant='infoGroupText'>{`${box.value || "?"}`}</Text>
            </Box>
          </GridItem>
        );
      })}
    </Grid>
  </Box>
);

export default InfoGroup;
