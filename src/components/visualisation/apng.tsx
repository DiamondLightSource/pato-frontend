import { Image, Skeleton, Heading, VStack } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import parseAPNG, { Frame } from "apng-js";
import { client } from "utils/api/client";

export interface ApngProps {
  /* Current selected frame */
  frameIndex?: number;
  /* Callback function for frame count changes */
  onFrameCountChanged?: (frameCount: number) => void;
  /* Caption for the viewer */
  caption?: string;
  /* Image source URL */
  src: string;
}

const APNGViewer = ({ src, onFrameCountChanged, frameIndex = 0, caption }: ApngProps) => {
  const [frames, setFrames] = useState<Frame[] | null>();
  const [currentFrame, setCurrentFrame] = useState<string>();

  useEffect(() => {
    setCurrentFrame(undefined);
    client.safeGet(src).then((response) => {
      if (response.status !== 200) {
        setFrames(null);
        return;
      }

      const apng = parseAPNG(response.data);
      if (apng instanceof Error) {
        setFrames(null);
      } else {
        setFrames(apng.frames);
        if (apng.frames.length && onFrameCountChanged) {
          onFrameCountChanged(apng.frames.length);
        }
      }
    });
  }, [src, onFrameCountChanged]);

  useEffect(() => {
    if (frames && frameIndex < frames.length) {
      const frame = frames[frameIndex];
      if (frame.imageData !== null) {
        setCurrentFrame(URL.createObjectURL(frame.imageData));
      }
    }
  }, [frames, frameIndex]);

  return (
    <VStack h='100%' w='100%' spacing='0' bg='diamond.100'>
      {currentFrame ? (
        <Image
          alt={caption || "APNG Image"}
          aria-label='Frame Image'
          objectFit='contain'
          maxW='100%'
          h='100%'
          src={currentFrame}
        />
      ) : frames === null ? (
        <Heading alignItems='center' display='flex' h='100%' variant='notFound'>
          No Image Data Available
        </Heading>
      ) : (
        <Skeleton h='100%' w='100%' />
      )}
      {caption && (
        <Heading py={2} textAlign='center' w='100%' bg='diamond.75' size='sm'>
          {caption}
        </Heading>
      )}
    </VStack>
  );
};

export default APNGViewer;
