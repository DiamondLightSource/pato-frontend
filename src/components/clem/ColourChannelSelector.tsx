import { Button, ButtonGroup, HStack, Tooltip } from "@chakra-ui/react";
import { useCallback, useMemo } from "react";
import { ColourChannel } from "schema/interfaces";
import { getAvailableColours } from "utils/generic";
import { COLOUR_NAME } from "utils/validation";
import { MdContentCopy } from "react-icons/md";

interface ColourButtonInterface {
  colour: ColourChannel;
  onToggle: (colour: ColourChannel) => void;
  isActive: boolean;
  isEnabled?: boolean;
  imagePath: string;
}

const ColourButton = ({ colour, onToggle, isActive, isEnabled, imagePath }: ColourButtonInterface) => {
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
    <Tooltip label={imagePath} isDisabled={!isEnabled}>
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
    </Tooltip>
  );
};

export interface ColourChannelSelectorProps {
  onChange?: (colours: ReturnType<typeof getAvailableColours>) => void;
  selectedColours: ReturnType<typeof getAvailableColours>;
  baseImagePath: string | null;
}

export const ColourChannelSelector = ({ onChange, selectedColours, baseImagePath }: ColourChannelSelectorProps) => {
  const toggleColour = useCallback(
    (colour: ColourChannel) => {
      if (!onChange) {
        return;
      }

      const newColours = structuredClone(selectedColours);
      newColours[colour] = !newColours[colour];

      onChange(newColours);
    },
    [onChange, selectedColours],
  );

  const copyAtlasPath = () => {
    if (!baseImagePath) {
      return;
    }

    navigator.clipboard.writeText(baseImagePath.substring(0, baseImagePath.lastIndexOf("/")));
  };

  return (
    <HStack>
      <Button leftIcon={<MdContentCopy/>} onClick={copyAtlasPath}>Copy Path</Button>
      <ButtonGroup isAttached>
        {Object.entries(selectedColours).map(([colour, enabled]) => (
          <ColourButton
            key={colour}
            colour={colour as ColourChannel}
            onToggle={toggleColour}
            isActive={!!enabled}
            isEnabled={enabled !== null}
            imagePath={
              baseImagePath ? baseImagePath.replace("*", colour === "grey" ? "gray" : colour) : "No Image Path"
            }
          />
        ))}
      </ButtonGroup>
    </HStack>
  );
};
