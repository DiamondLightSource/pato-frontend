import { Heading, VStack, Link } from "@chakra-ui/react";
import { AtlasResponse } from "loaders/atlas";
import { useCallback, useMemo, useState } from "react";
import { useLoaderData } from "react-router";
import { components } from "schema/main";
import { prependApiUrl } from "utils/api/client";
import "styles/atlas.css";
import { ColourChannelDisplay } from "components/clem/ColourChannelDisplay";
import { getAvailableColours } from "utils/generic";

// TODO: make heatmap component more generic so we can replace this atlas view with it
export interface AtlasProps {
  groupId: string;
  onGridSquareClicked?: (gridSquare: components["schemas"]["GridSquare"]) => void;
  selectedGridSquare?: number | null;
  colours?: ReturnType<typeof getAvailableColours> | null;
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
        fill: "black",
        fillOpacity: "0.2",
      };
};

export const Atlas = ({
  groupId,
  onGridSquareClicked,
  selectedGridSquare,
  colours,
}: AtlasProps) => {
  const [svgDimensions, setSvgDimensions] = useState({ width: 512, height: 512 });
  const data = useLoaderData() as AtlasResponse;
  const handleGridSquareClicked = useCallback(
    (gridSquare: components["schemas"]["GridSquare"]) => {
      if (onGridSquareClicked && gridSquare.image) {
        onGridSquareClicked(gridSquare);
      }
    },
    [onGridSquareClicked]
  );

  const viewBoxSize = useMemo(() => {
    return `0 0 ${svgDimensions.width} ${svgDimensions.height}`;
  }, [svgDimensions]);

  if (!data?.atlas) {
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
    <div className='img-wrapper' style={{ marginBottom: colours ? "6em" : "0" }}>
      {colours ? (
        <ColourChannelDisplay
          itemId={groupId}
          minHeight='820px'
          height='820px'
          colours={colours}
          onLoad={setSvgDimensions}
        />
      ) : (
        <img src={prependApiUrl(`dataGroups/${groupId}/atlas/image`)} alt='Atlas' />
      )}
      <svg viewBox={viewBoxSize} className='static-png' style={{ width: colours ? "95%" : "100%" }}>
        {data.gridSquares &&
          data.gridSquares.map((gridSquare, index) => (
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
