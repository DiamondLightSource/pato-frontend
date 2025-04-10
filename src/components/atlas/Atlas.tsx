import { Heading, VStack, Link } from "@chakra-ui/react";
import { AtlasResponse } from "loaders/atlas";
import { useCallback } from "react";
import { useLoaderData } from "react-router";
import { components } from "schema/main";
import { prependApiUrl } from "utils/api/client";
import "styles/atlas.css";

export interface AtlasProps {
  groupId: string;
  onGridSquareClicked?: (gridSquare: components["schemas"]["GridSquare"]) => void;
  selectedGridSquare?: number | null;
}

const sortSquare = (
  gridSquare: components["schemas"]["GridSquare"],
  selectedGridSquare: number | null
) => {
  return gridSquare.image
    ? {
        role: "button",
        stroke: "green",
        fill: selectedGridSquare === gridSquare.gridSquareId ? "blue" : "green",
        fillOpacity: "0.4",
        cursor: "pointer",
      }
    : {
        stroke: "red",
        strokeOpacity: "0.4",
        fill: "red",
        fillOpacity: "0.2",
      };
};

export const Atlas = ({ groupId, onGridSquareClicked, selectedGridSquare }: AtlasProps) => {
  const data = useLoaderData() as AtlasResponse;
  const handleGridSquareClicked = useCallback(
    (gridSquare: components["schemas"]["GridSquare"]) => {
      if (onGridSquareClicked && gridSquare.image) {
        onGridSquareClicked(gridSquare);
      }
    },
    [onGridSquareClicked]
  );

  if (!data?.gridSquares || data.gridSquares.length < 1) {
    return (
      <VStack flex='1 0 500px' h='690px' textAlign='center' justifyContent='center'>
        <Heading variant='notFound' size='md'>
          No atlas grid information available
        </Heading>
        <Link color='diamond.700' href='..'>
          Go back
        </Link>
      </VStack>
    );
  }

  return (
    <div style={{ display: "flex", flex: "1 0 300px" }} className='img-wrapper'>
      <img src={prependApiUrl(`dataGroups/${groupId}/atlas/image`)} alt='Atlas' />
      <svg viewBox='0 0 512 512'>
        {data.gridSquares.map((gridSquare, index) => (
          <rect
            data-testid={`square-${index}`}
            key={gridSquare.gridSquareId}
            x={gridSquare.x - gridSquare.width / 2}
            y={gridSquare.y - gridSquare.height / 2}
            width={gridSquare.width}
            height={gridSquare.height}
            transform={`rotate(${(180 / Math.PI) * gridSquare.angle} ${gridSquare.x} ${gridSquare.y})`}
            onClick={() => handleGridSquareClicked(gridSquare)}
            {...sortSquare(gridSquare, selectedGridSquare!)}
          />
        ))}
      </svg>
    </div>
  );
};
