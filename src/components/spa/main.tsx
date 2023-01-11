import { Divider, Grid, Heading, Skeleton, Box, GridItem } from "@chakra-ui/react";
import Scatter from "../scatter";
import Motion from "../motion/motion";
import { useEffect, useState } from "react";
import { client } from "../../utils/api/client";
import { driftPlotOptions } from "../../utils/plot";
import { CtfData } from "../../utils/interfaces";
import Class2d from "./class2d";
import ParticlePicking from "./particlePicking";

/* The reason why this is a separate component is that in the future, tomograms might no longer have a 1:1
 ** relationship with data collections. Should that happen, just reuse this component.
 */

interface SpaProps {
  /* Parent processing ID*/
  processingJobId: number;
  /* Parent autoprocessing program ID*/
  autoProcId: number;
}

const astigmatismPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { title: { display: true, text: "nm" } } },
};

const defocusPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { title: { display: true, text: "μm" } } },
};

const resolutionPlotOptions = {
  ...driftPlotOptions,
  scales: { y: { max: 10, title: { display: true, text: "Å" } } },
};

const SPA = ({ processingJobId, autoProcId }: SpaProps) => {
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

  return (
    <Box p={4}>
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
      <Motion
        onMotionChanged={(_, newPage) => setPage(newPage)}
        onTotalChanged={(e) => setTotal(e)}
        parentType='autoProc'
        parentId={autoProcId}
      />
      <ParticlePicking autoProcId={autoProcId} page={page} total={total} />
      <Class2d autoProcId={autoProcId} />
    </Box>
  );
};

export default SPA;
