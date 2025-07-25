import { Checkbox, Divider, Heading, HStack, Spacer, VStack } from "@chakra-ui/react";
import { Atlas } from "components/atlas/Atlas";
import { GridSquare } from "components/atlas/GridSquare";
import { SearchMap } from "components/atlas/SearchMap";
import { AtlasResponse } from "loaders/atlas";
import { useCallback, useMemo } from "react";
import { useLoaderData, useParams, useSearchParams } from "react-router";
import { components } from "schema/main";

/*
 * Pixel sizes on atlases and search maps are not consistent (due to magnification and other)
 * factors, so we need to apply a scaling factor when displaying tomograms on search maps.
 * This does not apply to grid squares and foil holes.
 */
const ATLAS_SEARCH_MAP_SCALING_FACTOR = 7.8;

const AtlasPage = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const data = useLoaderData() as AtlasResponse;

  const gridSquareId = useMemo(() => {
    const gridSquare = searchParams.get("gridSquare");
    if (gridSquare) {
      const intGridSquare = parseInt(gridSquare);
      return isNaN(intGridSquare) ? null : intGridSquare;
    }

    return null;
  }, [searchParams]);

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
      (512 * 1e-10) / data.atlas.pixelSize / gridSquare.width / ATLAS_SEARCH_MAP_SCALING_FACTOR
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

  const handleCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchParams((prev) => {
      prev.set("hideSquares", e.target.checked.toString());
      return prev;
    });
  };

  return (
    <VStack alignItems='start'>
      <HStack w='100%'>
        <Heading>Atlas</Heading>
        <Spacer />
        <Checkbox
          defaultChecked={searchParams.get("hideSquares") === "true"}
          onChange={handleCheck}
          size='lg'
        >
          Hide uncollected grid squares
        </Checkbox>
      </HStack>
      <Divider />
      <HStack w='100%' h='100%' alignItems='start' flexWrap='wrap'>
        <Atlas
          groupId={params.groupId!}
          onGridSquareClicked={handleGridSquareClicked}
          selectedGridSquare={gridSquareId}
        ></Atlas>
        {data.dataCollectionGroup.experimentTypeName === "Tomography" ? (
          <SearchMap searchMapId={gridSquareId} scalingFactor={scalingFactor} />
        ) : (
          <GridSquare gridSquareId={gridSquareId} />
        )}
      </HStack>
    </VStack>
  );
};

export default AtlasPage;
