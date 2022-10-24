import { Box, Heading, Image } from "@chakra-ui/react";
import { FunctionComponent } from "react";

interface ImageProp {
  title: string;
  src: string;
  width?: string;
  height?: string;
}

const ImageWrapper: FunctionComponent<ImageProp> = ({ title, src, width = "100%", height = "100%" }): JSX.Element => (
  <Box p={3} borderWidth='1px' borderRadius='lg' w={width} h={height}>
    <Heading size='sm'>{title}</Heading>
    <Image src={src} fallbackSrc='/images/no-image.png' />
  </Box>
);

export default ImageWrapper;
