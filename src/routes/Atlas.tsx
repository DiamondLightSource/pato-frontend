import { Checkbox, Divider, Heading, HStack, Spacer, VStack } from "@chakra-ui/react";
import { Atlas } from "components/atlas/Atlas";
import { GridSquare } from "components/atlas/GridSquare";
import { useCallback, useMemo } from "react";
import { useParams, useSearchParams } from "react-router";
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
        <GridSquare gridSquareId={gridSquareId} />
      </HStack>
    </VStack>
  );
};

export default AtlasPage;
