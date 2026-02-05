import { Button, ButtonGroup } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { components } from "schema/main";
import { getAvailableColours } from "utils/generic";
import { COLOUR_NAME } from "utils/validation";

export type ColourChannel = components["schemas"]["ColourChannel"];

interface ColourButtonInterface {
  colour: ColourChannel;
  onToggle: (colour: ColourChannel) => void;
  isActive: boolean;
  isEnabled?: boolean;
}

const ColourButton = ({ colour, onToggle, isActive, isEnabled }: ColourButtonInterface) => {
  const buttonColour = useMemo(() => {
    switch (colour) {
      case "magenta":
        return "pink";
      case "grey":
        return "gray";
      default:
        return colour;
    }
  }, [colour]);

  return (
    <Button
      isDisabled={!isEnabled}
      variant='outline'
      colorScheme={buttonColour}
      aria-selected={isActive}
      bg={`${buttonColour}${isActive ? ".200" : undefined}`}
      onClick={() => onToggle(colour)}
    >
      {COLOUR_NAME[colour]}
    </Button>
  );
};

export interface ColourChannelSelectorProps {
  onChange?: (colours: ReturnType<typeof getAvailableColours>) => void;
  selectedColours: ReturnType<typeof getAvailableColours>;
}

export const ColourChannelSelector = ({
  onChange,
  selectedColours,
}: ColourChannelSelectorProps) => {
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
        <ColourButton
          key={colour}
          colour={colour as ColourChannel}
          onToggle={toggleColour}
          isActive={!!enabled}
          isEnabled={enabled !== null}
        />
      ))}
    </ButtonGroup>
  );
};
