import {
  Box,
  Image,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  Spacer,
  ResponsiveValue,
  Skeleton,
  VStack,
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
  Heading,
} from "@chakra-ui/react";
import { useEffect, useMemo, useRef, useState } from "react";
import parseAPNG, { Frame } from "apng-js";
import { client } from "utils/api/client";
import { MdFastForward, MdFastRewind, MdPause, MdPlayArrow } from "react-icons/md";

interface ImageProps {
  width?: ResponsiveValue<string | number | "auto">;
  height?: ResponsiveValue<string | number | "auto">;
  src: string;
}

const APNGViewer = ({ src, width = "100%", height = "64vh" }: ImageProps) => {
  const [frames, setFrames] = useState<Frame[] | null>();
  const [currentFrame, setCurrentFrame] = useState<string>();
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [frametime, setFrametime] = useState(60);
  const [playForward, setPlayForward] = useState<boolean>(true);

  const playRef = useRef<ReturnType<typeof setInterval>>();

  const playIncrement = useMemo(() => (playForward ? 1 : -1), [playForward]);

  useEffect(() => {
    client.safeGet(src).then((response) => {
      if (response.status !== 200) {
        setFrames(null);
      }

      const apng = parseAPNG(response.data);
      if (apng instanceof Error) {
        setFrames(null);
        return;
      }

      setFrames(apng.frames);
    });
  }, [src]);

  const frameLength = useMemo(() => (frames ? frames.length - 1 : 100), [frames]);

  useEffect(() => {
    if (frames) {
      const frame = frames[frameIndex];
      if (frame.imageData !== null) {
        setCurrentFrame(URL.createObjectURL(frame.imageData));
      }
    }
  }, [frames, frameIndex]);

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
    <Box h={height} w={width} p={4}>
      <HStack h='90%'>
        {currentFrame ? (
          <VStack bg='diamond.100' h='100%' w='100%'>
            <Image aria-label='Frame Image' objectFit='contain' h='100%' maxW='100%' src={currentFrame} />
          </VStack>
        ) : (
          <>
            {frames === null ? (
              <VStack w='100%' h='100%' bg='diamond.100'>
                <Heading m='auto' variant='notFound'>
                  No Image Data Available
                </Heading>
              </VStack>
            ) : (
              <Skeleton h='100%' w='100%' />
            )}
          </>
        )}
        <Spacer />
        <Slider
          isDisabled={!frames}
          onChange={setFrameIndex}
          min={0}
          value={frameIndex}
          defaultValue={0}
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
      <HStack mt='2%' h='8%'>
        <Button isDisabled={!frames} onClick={() => setPlaying(!playing)}>
          <Icon aria-label={playing ? "Pause" : "Play"} as={playing ? MdPause : MdPlayArrow}></Icon>
        </Button>
        <ButtonGroup isAttached>
          <Button aria-label='Play in Reverse' isDisabled={!playForward || !frames} onClick={() => setPlayForward(false)}>
            <Icon as={MdFastRewind} />
          </Button>
          <Button aria-label='Play Forwards' isDisabled={playForward} onClick={() => setPlayForward(true)}>
            <Icon as={MdFastForward} />
          </Button>
        </ButtonGroup>
        <Divider borderColor='diamond.200' orientation='vertical' h='80%' />
        <Text size='md'>
          <b>FPS:</b>
        </Text>
        <NumberInput
          isDisabled={!frames}
          size='sm'
          w='15%'
          onChange={(_, fps) => setFrametime(1000 / fps)}
          step={1}
          defaultValue={60}
          min={1}
          max={200}
        >
          <NumberInputField bg='white' />
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

export default APNGViewer;
