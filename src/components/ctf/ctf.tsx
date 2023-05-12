import { Divider, Heading, Skeleton, Stack } from "@chakra-ui/react";
import {
  astigmatismPlotOptions,
  defocusPlotOptions,
  resolutionPlotOptions,
  resolutionSpaPlotOptions,
} from "utils/config/plot";
import { PlotContainer } from "components/visualisation/plotContainer";
import { client } from "utils/api/client";
import { CtfData } from "schema/interfaces";
import { Scatter } from "components/plots/scatter";
import { useQuery } from "@tanstack/react-query";

export interface CTFProps {
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
  });

  return (
    <>
      <Heading variant='collection'>Summary</Heading>
      <Divider />
      {isLoading ? (
        <Skeleton h='20vh' />
      ) : (
        <Stack
          w='100%'
          py={2}
          direction={{ base: "column", md: "row" }}
          h={{ base: "50vh", md: "20vh" }}
        >
          <PlotContainer title='Astigmatism'>
            <Scatter onPointClicked={onGraphClicked} data={data!.astigmatism} options={astigmatismPlotOptions} />
          </PlotContainer>
          <PlotContainer title='Defocus'>
            <Scatter onPointClicked={onGraphClicked} data={data!.defocus} options={defocusPlotOptions} />
          </PlotContainer>
          <PlotContainer title='Resolution'>
            <Scatter onPointClicked={onGraphClicked} data={data!.resolution} options={resolutionOptions} />
          </PlotContainer>
        </Stack>
      )}
    </>
  );
};

export { CTF };
