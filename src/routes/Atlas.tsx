import { Checkbox, Divider, Heading, HStack, VStack } from "@chakra-ui/react";
import { Atlas } from "components/atlas/Atlas";
import { GridSquare } from "components/atlas/GridSquare";
import { SearchMap } from "components/atlas/SearchMap";
import { ColourChannelSelector } from "components/clem/ColourChannelSelector";
import { ClemROIs } from "components/clem/ROI";
import { AtlasResponse } from "loaders/atlas";
import { useCallback, useMemo, useState } from "react";
import { useLoaderData, useParams, useSearchParams } from "react-router";
import { components } from "schema/main";
import { getAvailableColours } from "utils/generic";

/*
 * Pixel sizes on atlases and search maps are not consistent (due to magnification and other
 * factors), so we need to apply a scaling factor when displaying tomograms on search maps.
 * This does not apply to grid squares and foil holes.
 * 
 * This has been removed for now, as it's easier to rempove the scaling factor in here than Murphy
 */
//const ATLAS_SEARCH_MAP_SCALING_FACTOR = 7.8;

const AtlasPage = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useLoaderData() as AtlasResponse;
  const [colours, setColours] = useState(getAvailableColours(data.atlas));

  const targetSearchParam = useMemo(
    () =>
      data.dataCollectionGroup.experimentTypeName === "Tomography"
        ? "hideEmptySearchMaps"
        : "hideSquares",
    [data]
  );

  const gridSquareId = useMemo(() => {
    const gridSquare = searchParams.get("gridSquare");
    if (gridSquare) {
      const intGridSquare = parseInt(gridSquare);
      return isNaN(intGridSquare) ? null : intGridSquare;
    }

    return null;
  }, [searchParams]);

  const selectedGridSquare = useMemo(() => {
    if (data.dataCollectionGroup.experimentTypeName !== "CLEM" || !gridSquareId) {
      // Return early if we're not CLEM - all other experiment types don't use grid square information directly
      return null;
    }

    return data.gridSquares.find((gridSquare) => gridSquare.gridSquareId === gridSquareId);
  }, [gridSquareId, data]);

  const scalingFactor = useMemo(() => {
    if (data.dataCollectionGroup.experimentTypeName !== "Tomography") {
      return 0;
    }

    const gridSquare = data.gridSquares.find(
      (gridSquare) => gridSquare.gridSquareId === gridSquareId
    );

    if (!gridSquare) {
      return 0;
    }

    /*
     * When converting from MRC files to JPG, the image is binned to always have 512px width (hence 512)
     * Atlas pixel sizes are stored in metres, while pixel sizes for tomograms are stored in angstroms,
     * so we'll also scale it so the units match (hence 1e-10)
     */
    return (
      (512 * 1e-10) / data.atlas.pixelSize / gridSquare.width
    );
  }, [data, gridSquareId]);

  const handleGridSquareClicked = useCallback(
    (gridSquare: components["schemas"]["GridSquare"]) => {
      /* 
      Search params are set like this so as not to overwrite hideSquares. 
      See the example in the React Router docs:
      https://api.reactrouter.com/v7/types/react_router.SetURLSearchParams.html
      */
      setSearchParams((prev) => {
        prev.set("gridSquare", gridSquare.gridSquareId.toString());
        return prev;
      });
    },
    [setSearchParams]
  );

  const handleCheck = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchParams((prev) => {
        prev.set(targetSearchParam, e.target.checked.toString());
        return prev;
      });
    },
    [targetSearchParam, setSearchParams]
  );

  return (
    <VStack alignItems='start'>
      <HStack w='100%'>
        <Heading pr='0.5em'>Atlas</Heading>
        {data.dataCollectionGroup.experimentTypeName === "CLEM" ? (
          <ColourChannelSelector onChange={setColours} selectedColours={colours} />
        ) : (
          <Checkbox
            defaultChecked={searchParams.get(targetSearchParam) === "true"}
            onChange={handleCheck}
            size='lg'
          >
            Hide{" "}
            {data.dataCollectionGroup.experimentTypeName === "Tomography"
              ? "empty search maps"
              : "uncollected grid squares"}
          </Checkbox>
        )}
      </HStack>
      <Divider />
      <HStack w='100%' h='100%' alignItems='start' flexWrap='wrap'>
        <Atlas
          groupId={params.groupId!}
          onGridSquareClicked={handleGridSquareClicked}
          selectedGridSquare={gridSquareId}
          colours={data.dataCollectionGroup.experimentTypeName === "CLEM" ? colours : null}
        ></Atlas>
        {data.dataCollectionGroup.experimentTypeName === "Tomography" ? (
          <SearchMap searchMapId={gridSquareId} scalingFactor={scalingFactor} />
        ) : data.dataCollectionGroup.experimentTypeName === "CLEM" ? (
          <ClemROIs gridSquare={selectedGridSquare} />
        ) : (
          <GridSquare gridSquareId={gridSquareId} />
        )}
      </HStack>
    </VStack>
  );
};

export default AtlasPage;
