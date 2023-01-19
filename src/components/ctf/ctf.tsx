import { Divider, Grid, Heading, Skeleton, GridItem } from "@chakra-ui/react";
import {
  astigmatismPlotOptions,
  defocusPlotOptions,
  resolutionPlotOptions,
  resolutionSpaPlotOptions,
} from "../../utils/config/plot";
import { PlotContainer } from "../visualisation/plotContainer";
import { useEffect, useState } from "react";
import { client } from "../../utils/api/client";
import { CtfData } from "../../utils/interfaces";
import { Scatter } from "../plots/scatter";

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
            <PlotContainer title='Astigmatism' height='20vh'>
              <Scatter data={ctfData.astigmatism} options={astigmatismPlotOptions} />
            </PlotContainer>
          </GridItem>
          <GridItem minW='100%'>
            <PlotContainer height='20vh' title='Defocus'>
              <Scatter data={ctfData.defocus} options={defocusPlotOptions} />
            </PlotContainer>
          </GridItem>
          <GridItem minW='100%'>
            <PlotContainer height='20vh' title='Resolution'>
              <Scatter data={ctfData.resolution} options={resolutionOptions} />
            </PlotContainer>
          </GridItem>
        </Grid>
      )}
    </>
  );
};

export { CTF };
