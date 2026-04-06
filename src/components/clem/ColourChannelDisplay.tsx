import { useMemo } from "react";
import { prependApiUrl } from "utils/api/client";
import { getAvailableColours } from "utils/generic";
import { Box, Heading } from "@chakra-ui/react";
import APNGContainer from "components/visualisation/apngContainer";
import { ApngProps } from "@diamondlightsource/ui-components";

export interface ColourChannelDisplayProps {
  itemId: number | string;
  colours: ReturnType<typeof getAvailableColours>;
  dataType?: "gridSquare" | "atlas";
  onLoad?: ApngProps["onLoad"];
  height?: string;
  minHeight?: string;
}

export const ColourChannelDisplay = ({
  colours,
  itemId,
  onLoad,
  dataType = "atlas",
  height = "70vh",
  minHeight="790px"
}: ColourChannelDisplayProps) => {
  const prefix = useMemo(
    () =>
      prependApiUrl(
        dataType === "atlas" ? `dataGroups/${itemId}/atlas/image` : `grid-squares/${itemId}/image`
      ),
    [dataType, itemId]
  );

  const colourCount = useMemo(
    () =>
      Object.values(colours).reduce((prev, enabled) => {
        if (enabled) {
          prev += 1;
        }
        return prev;
      }, 0),
    [colours]
  );

  if (!colourCount) {
    return (
      <Heading variant='notFound' size='md' w='100%' py='3em'>
        No colour channel selected
      </Heading>
    );
  }

  return (
    <Box width='100%' h='100%' minH={minHeight} position='relative'>
      <APNGContainer
        onLoad={onLoad}
        mb="1em"
        height={height}
        minH={minHeight}
        overlap={true}
        views={Object.entries(colours).map(([colour, enabled]) => ({
          src: `${prefix}?colour=${colour}`,
          hidden: !enabled,
        }))}
        fallbackToPng={true}
      />
    </Box>
  );
};
