import { useMemo } from "react";
import { ColourChannel } from "./ColourChannelSelector";
import { prependApiUrl } from "utils/api/client";

export interface ColourChannelDisplayProps {
  groupId: number | string;
  colours: Record<ColourChannel, boolean>;
  dataType?: "gridSquare" | "atlas";
}

export const ColourChannelDisplay = ({ colours, groupId, dataType = "atlas" }: ColourChannelDisplayProps) => {
  const prefix = useMemo(
    () => prependApiUrl(dataType === "atlas" ? `dataGroups/${groupId}/atlas/image` : `grid-squares/${groupId}/image`),
    [dataType, groupId]
  );
  const selectedColours = useMemo(
    () =>
      Object.entries(colours).reduce((prev, [colour, enabled]) => {
        if (enabled) {
          prev.push(colour);
        }
        return prev;
      }, [] as string[]),
    [colours]
  );

  // The image is loaded as a child of the div as a "trick" to get the correct height, regardless of image size
  return (
    <div
      style={{
        width: "100%",
        height: "auto",
        position: "relative",
      }}
    >
      {selectedColours.map((colour) => (
        <img
          src={`${prefix}?colour=${colour}`}
          alt={colour}
          style={{ position: "absolute", top: 0, left: 0, opacity: 1 / 2 }}
        />
      ))}
    </div>
  );
};
