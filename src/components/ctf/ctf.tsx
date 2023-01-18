import { Divider, Grid, Heading, Skeleton, GridItem } from "@chakra-ui/react";
import {
  astigmatismPlotOptions,
  defocusPlotOptions,
  resolutionPlotOptions,
  resolutionSpaPlotOptions,
} from "../../utils/config/plot";
import { ScatterPlot } from "../visualisation/scatter";
import { useEffect, useState } from "react";
import { client } from "../../utils/api/client";
import { CtfData } from "../../utils/interfaces";

interface CTFProps {
  parentType: "autoProc" | "tomograms";
  parentId: number;
}

const CTF = ({ parentId, parentType }: CTFProps) => {
  const [ctfData, setCtfData] = useState<CtfData>();
  const resolutionOptions = parentType === "autoProc" ? resolutionSpaPlotOptions : resolutionPlotOptions;

  useEffect(() => {
    const ctfData: CtfData = { resolution: [], astigmatism: [], defocus: [] };
    client.safe_get(`${parentType}/${parentId}/ctf`).then((response) => {
      if (Array.isArray(response.data.items)) {
        for (const ctf of response.data.items) {
          // Converting astigmatism and defocus from Angstrom
          const index = parentType === "autoProc" ? ctf.imageNumber : ctf.refinedTiltAngle;
          ctfData.resolution.push({ x: index, y: ctf.estimatedResolution });
          ctfData.astigmatism.push({ x: index, y: ctf.astigmatism / 10 });
          ctfData.defocus.push({ x: index, y: ctf.estimatedDefocus / 10000 });
        }
        setCtfData(ctfData);
      }
    });
  }, [parentId, parentType]);

  return (
    <>
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
              data={ctfData.astigmatism}
              options={astigmatismPlotOptions}
            />
          </GridItem>
          <GridItem minW='100%'>
            <ScatterPlot height='20vh' title='Defocus' data={ctfData.defocus} options={defocusPlotOptions} />
          </GridItem>
          <GridItem minW='100%'>
            <ScatterPlot height='20vh' title='Resolution' data={ctfData.resolution} options={resolutionOptions} />
          </GridItem>
        </Grid>
      )}
    </>
  );
};

export { CTF };
