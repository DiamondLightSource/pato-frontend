import { VStack, HStack, Heading, Spacer, Divider } from "@chakra-ui/react"
import { ColourChannelDisplay } from "components/clem/ColourChannelDisplay"
import { ColourChannelSelector } from "./ColourChannelSelector"
import { useState } from "react";

export interface ClemROIsProps {
    gridSquareId: number | string | null;
}

export const ClemROIs = ({gridSquareId}: ClemROIsProps) => {
  const [colours, setColours] = useState({"red": true, "blue": true, "green": true, "gray": true});
    return <VStack
      display='flex'
      flex='1 0 300px'
      p='0.5em'
      bg='diamond.50'
      alignItems='start'
      border='1px solid'
      borderColor='diamond.900'
    >
      <HStack w='100%'>
        <Heading>ROIs</Heading>
        <Spacer />
        <ColourChannelSelector onChange={setColours} selectedColours={colours}/>
      </HStack>

      <Divider />
      {gridSquareId === null ? (
        <Heading w='100%' variant='notFound' size='md' h='512px' alignContent='center'>
          No grid square selected. Select one by clicking one of the atlas grid squares.
        </Heading>
      ) : <ColourChannelDisplay colours={colours} groupId={gridSquareId} dataType="gridSquare"/>}
    </VStack>
}