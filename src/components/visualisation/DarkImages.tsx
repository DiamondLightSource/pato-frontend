import { Heading } from "@chakra-ui/react";

export interface DarkImageCountProps {
  count?: number | null;
}

export const DarkImageCount = ({ count }: DarkImageCountProps) => {
  return (
    <Heading size='sm' display='flex' alignSelf='center' color='diamond.300'>
      {count === undefined
        ? "?"
        : count === null
          ? "No tilt alignment data available"
          : `Dark Images: ${count}`}
    </Heading>
  );
};
