import { Divider, Grid, Heading, Skeleton, GridItem } from "@chakra-ui/react";
import {
  astigmatismPlotOptions,
  defocusPlotOptions,
  resolutionPlotOptions,
  resolutionSpaPlotOptions,
} from "utils/config/plot";
import { PlotContainer } from "components/visualisation/plotContainer";
import { useEffect, useState } from "react";
import { client } from "utils/api/client";
import { CtfData } from "schema/interfaces";
import { Scatter } from "components/plots/scatter";

interface CTFProps {
  parentType: "autoProc" | "tomograms";
  parentId: number;
  /** Event fired when one of the graphs is clicked */
  onGraphClicked?: (x: number, y: number) => void;
}

const CTF = ({ parentId, parentType, onGraphClicked }: CTFProps) => {
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
        <Grid w='100%' py={2} marginBottom={6} templateColumns='repeat(3, 1fr)' h='20vh' gap={2}>
          <GridItem minW='100%'>
            <PlotContainer title='Astigmatism' height='20vh'>
              <Scatter onPointClicked={onGraphClicked} data={ctfData.astigmatism} options={astigmatismPlotOptions} />
            </PlotContainer>
          </GridItem>
          <GridItem minW='100%'>
            <PlotContainer height='20vh' title='Defocus'>
              <Scatter onPointClicked={onGraphClicked} data={ctfData.defocus} options={defocusPlotOptions} />
            </PlotContainer>
          </GridItem>
          <GridItem minW='100%'>
            <PlotContainer height='20vh' title='Resolution'>
              <Scatter onPointClicked={onGraphClicked} data={ctfData.resolution} options={resolutionOptions} />
            </PlotContainer>
          </GridItem>
        </Grid>
      )}
    </>
  );
};

export { CTF };
