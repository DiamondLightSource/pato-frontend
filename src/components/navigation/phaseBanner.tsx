import { HStack, Tag, Text, Link } from "@chakra-ui/react";

const PhaseBanner = () => (
  <HStack
    px='7.5vw'
    color='diamond.500'
    bg='diamond.700'
    borderBottom='3px solid var(--chakra-colors-diamond-500)'
    h='2.8vh'
    w='100%'
  >
    <Tag borderRadius='0' bg='diamond.500' color='diamond.800'>
      BETA
    </Tag>
    <Text fontSize='0.9em' color='diamond.50'>
      This is a preview of an upcoming version, certain features may be unstable. If you find any issues,
    </Text>
    <Link fontSize='0.9em' ml='4px !important' color='diamond.500'>
      contact the developers.
    </Link>
  </HStack>
);

export { PhaseBanner };
