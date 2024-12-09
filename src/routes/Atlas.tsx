import { Divider, Heading, HStack, VStack } from "@chakra-ui/react";
import { Atlas } from "components/atlas/Atlas";
import { GridSquare } from "components/atlas/GridSquare";
import { useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { components } from "schema/main";

const AtlasPage = () => {
  const params = useParams();
  const [searchParams, setSearchParams] = useSearchParams();

  const gridSquareId = useMemo(() => {
    const gridSquare = searchParams.get("gridSquare");
    if (gridSquare) {
      const intGridSquare = parseInt(gridSquare);
      return isNaN(intGridSquare) ? null : intGridSquare;
    }

    return null;
  }, [searchParams]);

  const handleGridSquareClicked = useCallback(
    (gridSquare: components["schemas"]["GridSquare"]) => {
      setSearchParams((prev) => ({ ...prev, gridSquare: gridSquare.gridSquareId }));
    },
    [setSearchParams]
  );

  return (
    <VStack alignItems='start'>
      <Heading>Atlas</Heading>
      <Divider />
      <HStack w='100%' h='100%' alignItems='start' flexWrap='wrap'>
        <Atlas
          groupId={params.groupId!}
          onGridSquareClicked={handleGridSquareClicked}
          selectedGridSquare={gridSquareId}
        ></Atlas>
        <GridSquare gridSquareId={gridSquareId} />
      </HStack>
    </VStack>
  );
};

export default AtlasPage;
