import { Box, Text, Grid, GridItem } from "@chakra-ui/react";
import { FunctionComponent } from "react";

export interface Info {
  title: string;
  value?: string;
  wide?: boolean;
}

interface InfoProp {
  info: Info[];
}

const InfoGroup: FunctionComponent<InfoProp> = ({ info }): JSX.Element => (
  <Box>
    <Grid templateColumns='repeat(2, minmax(0, 1fr))' gap={1}>
      {info.map((box: Info) => {
        return (
          <GridItem key={box.title} colSpan={box.wide ? 2 : 1}>
            <Box h='100%' p={1} borderRadius={3} bg='diamond.100'>
              <Text variant='infoGroupText' as='b'>{`${box.title}: `}</Text>
              <Text variant='infoGroupText'>{`${box.value || "?"}`}</Text>
            </Box>
          </GridItem>
        );
      })}
    </Grid>
  </Box>
);

export default InfoGroup;
