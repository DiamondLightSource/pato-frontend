import { Divider, Heading, Skeleton, VStack, HStack, useToast } from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import { components } from "schema/main";
import { client, prependApiUrl } from "utils/api/client";
import "styles/atlas.css";
import { useNavigate } from "react-router-dom";
import { baseToast } from "@diamondlightsource/ui-components";

type Tomogram = components["schemas"]["TomogramResponse"];

export interface SearchMapProps {
  searchMapId: number | null;
  scalingFactor: number;
}

interface TomogramRegion {
  dataCollectionId: number;
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

const fetchTomograms = async (searchMapId: number | null, scalingFactor: number) => {
  if (!searchMapId) {
    return null;
  }

  /** If this is a search map, get the list of tomograms instead of foil holes */
  const tomogramReq = await client.safeGet(`grid-squares/${searchMapId}/tomograms?limit=3000`);

  if (tomogramReq.status !== 200) {
    return null;
  }

  return tomogramReq.data.items.reduce((filtered: TomogramRegion[], tomogram: Tomogram) => {
    if (
      !tomogram.pixelLocationX ||
      !tomogram.pixelLocationY ||
      !tomogram.sizeX ||
      !tomogram.sizeY ||
      !tomogram.pixelSpacing
    ) {
      return filtered;
    }

    filtered.push({
      dataCollectionId: tomogram.dataCollectionId,
      id: tomogram.tomogramId,
      // Binning and pixel size conversion from atlas to search map
      x: tomogram.pixelLocationX,
      y: tomogram.pixelLocationY,
      // Apply tomogram pixel size conversion and scaling factor
      width: tomogram.sizeX * tomogram.pixelSpacing * scalingFactor,
      height: tomogram.sizeY * tomogram.pixelSpacing * scalingFactor,
    });

    return filtered;
  }, []) as TomogramRegion[];
};

export const SearchMap = ({ searchMapId, scalingFactor }: SearchMapProps) => {
  const { data, isLoading } = useQuery({
    queryKey: ["searchMapTomograms", searchMapId],
    queryFn: async () => await fetchTomograms(searchMapId, scalingFactor),
  });

  const navigate = useNavigate();
  const toast = useToast();

  const handleItemClicked = useCallback(
    async (tomogram: TomogramRegion) => {
      const response = await client.safeGet(`dataCollections/${tomogram.dataCollectionId}`);

      if (response.status !== 200) {
        toast({
          ...baseToast,
          title: "Error",
          description: "Could not get tomogram information",
          status: "error",
        });
        return;
      }

      const dataCollection: components["schemas"]["BaseDataCollectionOut"] = response.data;

      navigate(`../tomograms/${dataCollection.index}`, { relative: "path" });
    },
    [navigate, toast]
  );

  return (
    <VStack
      display='flex'
      flex='1 0 300px'
      p='0.5em'
      bg='diamond.50'
      alignItems='start'
      border='1px solid'
      borderColor='diamond.900'
    >
      <HStack w='100%'>
        <Heading>Search Map</Heading>
      </HStack>

      <Divider />
      {searchMapId === null ? (
        <Heading w='100%' variant='notFound' size='md' h='512px' alignContent='center'>
          No search map selected. Select one by clicking one of the squares on the atlas.
        </Heading>
      ) : data === undefined || isLoading ? (
        <Skeleton h='512px' w='100%' />
      ) : data === null ? (
        <Heading variant='notFound' size='md' h='512px' w='100%' alignContent='center'>
          No tomograms available
        </Heading>
      ) : (
        <div style={{ width: "100%", overflow: "hidden" }} className='img-wrapper'>
          <img src={prependApiUrl(`grid-squares/${searchMapId}/image`)} alt='Search Map' />
          <svg viewBox='0 0 512 800'>
            {data.map((item, i) => (
              <rect
                data-testid={`item-${i}`}
                key={i}
                x={item.x - item.width / 2}
                y={item.y - item.height / 2}
                width={item.width}
                height={item.height}
                onClick={() => handleItemClicked(item)}
                role='button'
                stroke='green'
                fill='green'
                fillOpacity='0.4'
                cursor='pointer'
              />
            ))}
          </svg>
        </div>
      )}
    </VStack>
  );
};
