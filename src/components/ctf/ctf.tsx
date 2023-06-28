import { Checkbox, Divider, HStack, Heading, Skeleton, Spacer, Stack, Box } from "@chakra-ui/react";
import {
  astigmatismPlotOptions,
  defocusPlotOptions,
  resolutionPlotOptions,
  resolutionSpaPlotOptions,
} from "utils/config/plot";
import { PlotContainer } from "components/visualisation/plotContainer";
import { client } from "utils/api/client";
import { CtfData } from "schema/interfaces";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ScatterPlot } from "diamond-components";

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
  const resolutionOptions =
    parentType === "autoProc" ? resolutionSpaPlotOptions : resolutionPlotOptions;
  const [decimate, setDecimate] = useState(true);

  const { data, isLoading } = useQuery({
    queryKey: ["ctf", parentType, parentId],
    queryFn: async () => await fetchCtfData(parentType, parentId),
  });

  const threshold = useMemo(() => (decimate ? 0.04 : 0), [decimate]);

  return (
    <Box minW='0'>
      <HStack>
        <Heading variant='collection'>Summary</Heading>
        <Spacer />
        <Checkbox size='sm' onChange={() => setDecimate(!decimate)} isChecked={decimate}>
          Decimate Data
        </Checkbox>
      </HStack>
      <Divider />
      {isLoading ? (
        <Skeleton h='300px' />
      ) : (
        <Stack
          w='100%'
          py={2}
          direction={{ base: "column", md: "row" }}
          h={{ base: "50vh", md: "300px" }}
        >
          <PlotContainer title='Astigmatism'>
            <ScatterPlot
              decimationThreshold={threshold}
              onPointClicked={onGraphClicked}
              data={data!.astigmatism}
              options={astigmatismPlotOptions}
            />
          </PlotContainer>
          <PlotContainer title='Defocus'>
            <ScatterPlot
              decimationThreshold={threshold}
              onPointClicked={onGraphClicked}
              data={data!.defocus}
              options={defocusPlotOptions}
            />
          </PlotContainer>
          <PlotContainer title='Resolution'>
            <ScatterPlot
              decimationThreshold={threshold}
              onPointClicked={onGraphClicked}
              data={data!.resolution}
              options={resolutionOptions}
            />
          </PlotContainer>
        </Stack>
      )}
    </Box>
  );
};

export { CTF };
