import { Button, ButtonGroup } from "@chakra-ui/react";
import { useCallback, useEffect } from "react";
import { components } from "schema/main";

export type ColourChannel = components["schemas"]["ColourChannel"];

const COLOUR_NAME = {
  "red": "R",
  "green": "G",
  "blue": "B",
  "gray": "Gy"
}

const ColourButton = ({
  colour,
  onToggle,
  isActive,
}: {
  colour: ColourChannel;
  onToggle: (colour: ColourChannel) => void;
  isActive: boolean;
}) => {
  useEffect(() => console.log(isActive), [isActive])
  return (
    <Button
      variant='outline'
      colorScheme={colour}
      bg={`${colour}${isActive ? ".200" : undefined}`}
      onClick={() => onToggle(colour)}
    >
      {COLOUR_NAME[colour]}
    </Button>
  );
};

export interface ColourChannelSelectorProps {
  onChange?: (colours: Record<ColourChannel, boolean>) => void;
  selectedColours: Record<ColourChannel, boolean>;
}

export const ColourChannelSelector = ({ onChange, selectedColours }: ColourChannelSelectorProps) => {
  const toggleColour = useCallback(
    (colour: ColourChannel) => {
      if (!onChange) {
        return;
      }

      const newColours = structuredClone(selectedColours);
      newColours[colour] = !newColours[colour];

      onChange(newColours);
    },
    [onChange, selectedColours]
  );

  return (
    <ButtonGroup isAttached>
      {Object.entries(selectedColours).map(([colour, enabled]) => (
        <ColourButton key={colour} colour={colour as ColourChannel} onToggle={toggleColour} isActive={enabled} />
      ))}
    </ButtonGroup>
  );
};
