import { useMemo } from "react";
import { prependApiUrl } from "utils/api/client";
import { getAvailableColours } from "utils/generic";
import { Box, Heading } from "@chakra-ui/react";
import APNGContainer from "components/visualisation/apngContainer";

export interface ColourChannelDisplayProps {
  itemId: number | string;
  colours: ReturnType<typeof getAvailableColours>;
  dataType?: "gridSquare" | "atlas";
}

export const ColourChannelDisplay = ({
  colours,
  itemId,
  dataType = "atlas",
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
    <Box width='100%' position='relative'>
      {dataType === "atlas" ? (
        Object.entries(colours).map(([colour, enabled]) => (
          <img
            key={colour}
            style={{ display: enabled ? "block" : "none", opacity: 1 / colourCount }}
            src={`${prefix}?colour=${colour}`}
            alt={colour}
          />
        ))
      ) : (
        <APNGContainer
          overlap={true}
          views={Object.entries(colours).map(([colour, enabled]) => ({
            src: `${prefix}?colour=${colour}`,
            hidden: !enabled,
          }))}
        />
      )}
    </Box>
  );
};
