import { VStack, HStack, Heading, Spacer, Divider } from "@chakra-ui/react";
import { ColourChannelDisplay } from "components/clem/ColourChannelDisplay";
import { ColourChannelSelector } from "./ColourChannelSelector";
import { useEffect, useState } from "react";
import { components } from "schema/main";
import { getAvailableColours } from "utils/generic";

export interface ClemROIsProps {
  gridSquare?: components["schemas"]["GridSquare"] | null;
}

export const ClemROIs = ({ gridSquare }: ClemROIsProps) => {
  const [colours, setColours] = useState<ReturnType<typeof getAvailableColours> | null>(null);

  useEffect(() => {
    if (gridSquare) {
      setColours(getAvailableColours(gridSquare));
    }
  }, [gridSquare]);

  return (
    <VStack
      display='flex'
      flex='1 0 300px'
      p='0.5em'
      pb='60px'
      bg='diamond.50'
      alignItems='start'
      border='1px solid'
      borderColor='diamond.900'
    >
      <HStack w='100%'>
        <Heading>ROIs</Heading>
        <Spacer />
        {colours && <ColourChannelSelector onChange={setColours} selectedColours={colours} />}
      </HStack>

      <Divider />
      {!gridSquare || !colours ? (
        <Heading w='100%' variant='notFound' size='md' h='512px' alignContent='center'>
          No grid square selected. Select one by clicking one of the atlas grid squares.
        </Heading>
      ) : (
        <ColourChannelDisplay
          colours={colours}
          itemId={gridSquare.gridSquareId}
          dataType='gridSquare'
        />
      )}
    </VStack>
  );
};
