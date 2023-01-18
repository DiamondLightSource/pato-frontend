import { Spacer, HStack, Divider, Grid, Button, Heading, Box, GridItem } from "@chakra-ui/react";
import { ImageCard } from "../visualisation/image";
import { InfoGroup } from "../visualisation/infogroup";
import { PlotContainer } from "../visualisation/plotContainer";
import { Motion } from "../motion/motion";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { MdSettings } from "react-icons/md";
import { client } from "../../utils/api/client";
import { TomogramData, Info, BasePoint } from "../../utils/interfaces";
import { CTF } from "../ctf/ctf";
import { Scatter } from "../plots/scatter";

/* The reason why this is a separate component is that in the future, tomograms might no longer have a 1:1
 ** relationship with data collections. Should that happen, just reuse this component.
 */

interface TomogramProps {
  /* Tomogram data */
  tomogram: TomogramData | null;
  /* Tomogram title (generally the data collection comment) */
  title: string | null;
  /* Parent data collection ID*/
  collection: number;
}

const Tomogram = ({ tomogram, title, collection }: TomogramProps) => {
  const [sliceImage, setSliceImage] = useState("");
  const [shiftData, setShiftData] = useState<BasePoint[]>([]);
  const [tomogramInfo, setTomogramInfo] = useState<Info[]>([]);

  const handleMotionChange = useCallback((data: Record<string, any>) => {
    if (data.refinedTiltAxis) {
      setTomogramInfo((oldInfo) =>
        oldInfo.map((t) => {
          return { label: t.label, value: t.label === "Refined Tilt Axis" ? data.refinedTiltAxis : t.value };
        })
      );
    }
  }, []);

  const setImage = (endpoint: string, setState: Dispatch<SetStateAction<string>>) => {
    client.safe_get(endpoint).then((response) => {
      if (response.status === 200) {
        setState(URL.createObjectURL(response.data));
      }
    });
  };

  useEffect(() => {
    if (tomogram === null) {
      return;
    }

    setImage(`tomograms/${tomogram.tomogramId}/centralSlice`, setSliceImage);

    client.safe_get(`tomograms/${tomogram.tomogramId}/shiftPlot`).then((response) => {
      if (response.status === 200 && response.data.items) {
        setShiftData(response.data.items);
      }
    });

    setTomogramInfo(tomogram.info);
  }, [tomogram]);

  return (
    <Box>
      <HStack py={1.5} px={3} bg='diamond.100'>
        <h2>{title ?? "No Title Provided"}</h2>
        <Spacer />
        <Button disabled>
          <MdSettings />
        </Button>
      </HStack>
      <Box border='1px solid' p={4} borderColor='diamond.100'>
        {tomogram === null ? (
          <Motion parentType={"dataCollections"} parentId={collection} />
        ) : (
          <Box>
            <Motion onMotionChanged={handleMotionChange} parentType='tomograms' parentId={tomogram.tomogramId} />
            <Heading marginTop={6} variant='collection'>
              Alignment
            </Heading>
            <Divider />
            <Grid py={2} templateColumns='repeat(3, 1fr)' gap={2}>
              <GridItem height={{ base: "20vh", md: "32vh" }}>
                <InfoGroup info={tomogramInfo} />
              </GridItem>
              <GridItem colSpan={{ base: 2, md: 1 }} height={{ base: "20vh", md: "32vh" }}>
                <ImageCard title='Central Slice' src={sliceImage} height='100%' />
              </GridItem>
              <GridItem colSpan={{ base: 3, md: 1 }} minW='100%' height={{ base: "20vh", md: "32vh" }}>
                <PlotContainer title='Shift Plot'>
                  <Scatter data={shiftData} />
                </PlotContainer>
              </GridItem>
            </Grid>
            <CTF parentId={tomogram.tomogramId} parentType='tomograms' />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export { Tomogram };
