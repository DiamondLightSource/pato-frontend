import { AtlasResponse } from "loaders/atlas";
import { useCallback } from "react";
import { useLoaderData } from "react-router-dom";
import { components } from "schema/main";
import { prependApiUrl } from "utils/api/client";

export interface AtlasProps {
  groupId: string;
  onGridSquareClicked?: (gridSquare: components["schemas"]["GridSquare"]) => void;
  selectedGridSquare?: number | null;
}

export const Atlas = ({ groupId, onGridSquareClicked, selectedGridSquare }: AtlasProps) => {
  const data = useLoaderData() as AtlasResponse;
  const handleGridSquareClicked = useCallback(
    (gridSquare: components["schemas"]["GridSquare"]) => {
      if (onGridSquareClicked) {
        onGridSquareClicked(gridSquare);
      }
    },
    [onGridSquareClicked]
  );

  return (
    <div style={{ display: "flex", flex: "1 0 500px" }}>
      <svg viewBox='0 0 512 512'>
        <image
          width='512'
          height='512'
          href={prependApiUrl(`/dataGroups/${groupId}/atlas/image`)}
        ></image>
        {data.gridSquares.map((gridSquare) => (
          <rect
            role='button'
            key={gridSquare.gridSquareId}
            x={gridSquare.x - gridSquare.width}
            y={gridSquare.y}
            width={gridSquare.width}
            height={gridSquare.height}
            stroke='green'
            fill={selectedGridSquare === gridSquare.gridSquareId ? "blue" : "green"}
            fillOpacity='0.4'
            cursor='pointer'
            transform={`rotate(${(180 / Math.PI) * gridSquare.angle} ${gridSquare.x + gridSquare.width / 20} ${gridSquare.y + gridSquare.height / 20})`}
            onClick={() => handleGridSquareClicked(gridSquare)}
          />
        ))}
      </svg>
    </div>
  );
};
