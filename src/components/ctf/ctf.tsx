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
import { useQuery } from "@tanstack/react-query";

interface CTFProps {
  parentType: "autoProc" | "tomograms";
  parentId: number;
  /** Event fired when one of the graphs is clicked */
  onGraphClicked?: (x: number, y: number) => void;
}

const fetchCtfData = async (parentType: "autoProc" | "tomograms", parentId: number) => {
  const ctfData: CtfData = { resolution: [], astigmatism: [], defocus: [] };
  const response = await client.safeGet(`${parentType}/${parentId}/ctf`);

  if (Array.isArray(response.data.items)) {
    for (const ctf of response.data.items) {
      // Converting astigmatism and defocus from Angstrom
      const index = parentType === "autoProc" ? ctf.imageNumber : ctf.refinedTiltAngle;
      ctfData.resolution.push({ x: index, y: ctf.estimatedResolution });
      ctfData.astigmatism.push({ x: index, y: ctf.astigmatism / 10 });
      ctfData.defocus.push({ x: index, y: ctf.estimatedDefocus / 10000 });
    }
  }

  return ctfData;
};

const CTF = ({ parentId, parentType, onGraphClicked }: CTFProps) => {
  const resolutionOptions = parentType === "autoProc" ? resolutionSpaPlotOptions : resolutionPlotOptions;

  const { data, isLoading } = useQuery({
    queryKey: ["ctf", parentType, parentId],
    queryFn: async () => await fetchCtfData(parentType, parentId),
    staleTime: 30000,
  });

  return (
    <>
      <Heading variant='collection'>Summary</Heading>
      <Divider />
      { isLoading ? (
        <Skeleton h='20vh' />
      ) : (
        <Grid w='100%' py={2} marginBottom={6} templateColumns='repeat(3, 1fr)' h='20vh' gap={2}>
          <GridItem minW='100%'>
            <PlotContainer title='Astigmatism' height='20vh'>
              <Scatter onPointClicked={onGraphClicked} data={data!.astigmatism} options={astigmatismPlotOptions} />
            </PlotContainer>
          </GridItem>
          <GridItem minW='100%'>
            <PlotContainer height='20vh' title='Defocus'>
              <Scatter onPointClicked={onGraphClicked} data={data!.defocus} options={defocusPlotOptions} />
            </PlotContainer>
          </GridItem>
          <GridItem minW='100%'>
            <PlotContainer height='20vh' title='Resolution'>
              <Scatter onPointClicked={onGraphClicked} data={data!.resolution} options={resolutionOptions} />
            </PlotContainer>
          </GridItem>
        </Grid>
      )}
    </>
  );
};

export { CTF };
