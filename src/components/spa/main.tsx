import { Divider, Grid, Heading, Skeleton, Box, GridItem } from "@chakra-ui/react";
import { ScatterPlot } from "../visualisation/scatter";
import { Motion } from "../motion/motion";
import { useCallback, useEffect, useState } from "react";
import { client } from "../../utils/api/client";
import { astigmatismPlotOptions, defocusPlotOptions, resolutionSpaPlotOptions } from "../../utils/config/plot";
import { CtfData } from "../../utils/interfaces";
import { Class2d } from "./class2d";
import { ParticlePicking } from "./particlePicking";

interface SpaProps {
  /* Parent autoprocessing program ID*/
  autoProcId: number;
}

const SPA = ({ autoProcId }: SpaProps) => {
  const [ctfData, setCtfData] = useState<CtfData>();
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number | undefined>();

  useEffect(() => {
    const ctfData: CtfData = { resolution: [], astigmatism: [], defocus: [] };
    client.safe_get(`autoProc/${autoProcId}/ctf`).then((response) => {
      if (Array.isArray(response.data.items)) {
        for (const ctf of response.data.items) {
          // Converting astigmatism and defocus from Angstrom
          ctfData.resolution.push({ x: ctf.imageNumber, y: ctf.estimatedResolution });
          ctfData.astigmatism.push({ x: ctf.imageNumber, y: ctf.astigmatism / 10 });
          ctfData.defocus.push({ x: ctf.imageNumber, y: ctf.estimatedDefocus / 10000 });
        }
        setCtfData(ctfData);
      }
    });
  }, [autoProcId]);

  const handlePageChanged = useCallback((_: any, newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <Box p={4}>
      <Heading variant='collection'>Summary</Heading>
      <Divider />
      {ctfData === undefined ? (
        <Skeleton h='20vh' />
      ) : (
        <Grid py={2} marginBottom={6} templateColumns='repeat(3, 1fr)' h='20vh' gap={2}>
          <GridItem minW='100%'>
            <ScatterPlot
              height='20vh'
              title='Astigmatism'
              scatterData={ctfData.astigmatism}
              options={astigmatismPlotOptions}
            />
          </GridItem>
          <GridItem minW='100%'>
            <ScatterPlot height='20vh' title='Defocus' scatterData={ctfData.defocus} options={defocusPlotOptions} />
          </GridItem>
          <GridItem minW='100%'>
            <ScatterPlot
              height='20vh'
              title='Resolution'
              scatterData={ctfData.resolution}
              options={resolutionSpaPlotOptions}
            />
          </GridItem>
        </Grid>
      )}
      <Motion
        onMotionChanged={handlePageChanged}
        onTotalChanged={setTotal}
        parentType='autoProc'
        parentId={autoProcId}
      />
      <ParticlePicking autoProcId={autoProcId} page={page} total={total} />
      <Class2d autoProcId={autoProcId} />
    </Box>
  );
};

export default SPA;
