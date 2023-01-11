import { Spacer, HStack, Divider, Grid, Button, Heading, Skeleton, Box, GridItem } from "@chakra-ui/react";
import Image from "./image";
import InfoGroup, { Info } from "./infogroup";
import Scatter from "./scatter";
import Motion from "./motion/motion";
import { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";
import { MdSettings } from "react-icons/md";
import { client } from "../utils/api/client";
import { ScatterDataPoint } from "chart.js";
import { astigmatismPlotOptions, defocusPlotOptions, resolutionPlotOptions } from "../utils/config/plot";
import { CtfData, TomogramData } from "../utils/interfaces";

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
  const [shiftData, setShiftData] = useState<ScatterDataPoint[]>([]);
  const [ctfData, setCtfData] = useState<CtfData>();
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

    const ctfData: CtfData = { resolution: [], astigmatism: [], defocus: [] };
    client.safe_get(`tomograms/${tomogram.tomogramId}/ctf`).then((response) => {
      if (Array.isArray(response.data.items)) {
        for (const ctf of response.data.items) {
          // Converting astigmatism and defocus from Angstrom
          ctfData.resolution.push({ x: ctf.refinedTiltAngle, y: ctf.estimatedResolution });
          ctfData.astigmatism.push({ x: ctf.refinedTiltAngle, y: ctf.astigmatism / 10 });
          ctfData.defocus.push({ x: ctf.refinedTiltAngle, y: ctf.estimatedDefocus / 10000 });
        }
        setCtfData(ctfData);
      }
    });

    client.safe_get(`tomograms/${tomogram.tomogramId}/shiftPlot`).then((response) => {
      if (response.status === 200) {
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
                <Image title='Central Slice' src={sliceImage} height='100%' />
              </GridItem>
              <GridItem colSpan={{ base: 3, md: 1 }} minW='100%' height={{ base: "20vh", md: "32vh" }}>
                <Scatter title='Shift Plot' scatterData={shiftData} />
              </GridItem>
            </Grid>
            <Heading variant='collection'>Summary</Heading>
            <Divider />
            {ctfData === undefined ? (
              <Skeleton h='20vh' />
            ) : (
              <Grid py={2} marginBottom={6} templateColumns='repeat(3, 1fr)' h='20vh' gap={2}>
                <GridItem minW='100%'>
                  <Scatter
                    height='20vh'
                    title='Astigmatism'
                    scatterData={ctfData.astigmatism}
                    options={astigmatismPlotOptions}
                  />
                </GridItem>
                <GridItem minW='100%'>
                  <Scatter height='20vh' title='Defocus' scatterData={ctfData.defocus} options={defocusPlotOptions} />
                </GridItem>
                <GridItem minW='100%'>
                  <Scatter
                    height='20vh'
                    title='Resolution'
                    scatterData={ctfData.resolution}
                    options={resolutionPlotOptions}
                  />
                </GridItem>
              </Grid>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Tomogram;
