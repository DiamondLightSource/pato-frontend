import {
  Box,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  Spacer,
  Text,
  Button,
  Icon,
  NumberInputField,
  NumberIncrementStepper,
  NumberDecrementStepper,
  NumberInputStepper,
  NumberInput,
  Divider,
  ButtonGroup,
  BoxProps,
} from "@chakra-ui/react";
import { cloneElement, useEffect, useMemo, useRef, useState } from "react";
import { MdFastForward, MdFastRewind, MdPause, MdPlayArrow } from "react-icons/md";
import { ApngProps } from "diamond-components";

export interface ApngContainerProps extends BoxProps {
  children: React.ReactElement<ApngProps> | React.ReactElement<ApngProps>[];
}

const APNGContainer = ({
  width = "100%",
  height = "64vh",
  children,
  ...props
}: ApngContainerProps) => {
  const [frameLength, setFrameLength] = useState<number>();
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [frametime, setFrametime] = useState(60);
  const [playForward, setPlayForward] = useState<boolean>(true);

  const playRef = useRef<ReturnType<typeof setInterval>>();

  const playIncrement = useMemo(() => (playForward ? 1 : -1), [playForward]);

  useEffect(() => {
    if (playing) {
      playRef.current = setInterval(() => {
        if ((playForward && frameIndex === frameLength) || (!playForward && frameIndex === 0)) {
          setPlaying(false);
        } else {
          setFrameIndex(frameIndex + playIncrement);
        }
      }, frametime);
    } else {
      clearInterval(playRef.current);
    }

    return () => clearInterval(playRef.current);
  }, [frameIndex, playing, frametime, frameLength, playIncrement, playForward]);

  return (
    <Box h={height} w={width} px={4} pt={4} pb='0' {...props}>
      <HStack h='90%'>
        {(Array.isArray(children) ? children : [children]).map((child, i) => (
          <Box key={i} h='100%' w='100%'>
            {cloneElement(child, { onFrameCountChanged: setFrameLength, frameIndex })}
          </Box>
        ))}
        <Spacer />
        <Slider
          isDisabled={!frameLength}
          onChange={setFrameIndex}
          min={0}
          value={frameIndex}
          max={frameLength}
          step={1}
          orientation='vertical'
          h='100%'
        >
          <SliderTrack bg='diamond.200'>
            <SliderFilledTrack bg='diamond.600' />
          </SliderTrack>
          <SliderThumb borderColor='diamond.300' />
        </Slider>
      </HStack>
      <HStack h='10%'>
        <Button isDisabled={!frameLength} onClick={() => setPlaying(!playing)}>
          <Icon aria-label={playing ? "Pause" : "Play"} as={playing ? MdPause : MdPlayArrow}></Icon>
        </Button>
        <ButtonGroup isAttached>
          <Button
            aria-label='Play in Reverse'
            isDisabled={!playForward || !frameLength}
            onClick={() => setPlayForward(false)}
          >
            <Icon as={MdFastRewind} />
          </Button>
          <Button
            aria-label='Play Forwards'
            isDisabled={playForward}
            onClick={() => setPlayForward(true)}
          >
            <Icon as={MdFastForward} />
          </Button>
        </ButtonGroup>
        <Divider borderColor='diamond.200' orientation='vertical' h='80%' />
        <Text size='md'>
          <b>FPS:</b>
        </Text>
        <NumberInput
          isDisabled={!frameLength}
          size='sm'
          w='15%'
          onChange={(_, fps) => setFrametime(1000 / fps)}
          step={1}
          defaultValue={60}
          min={1}
          max={200}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>
        <Spacer />
        <Text size='md'>
          <b>Current Frame:</b>
        </Text>
        <Text aria-label='Current Frame' size='md' w='50px' textAlign='right'>
          {frameIndex}
        </Text>
      </HStack>
    </Box>
  );
};

export default APNGContainer;
