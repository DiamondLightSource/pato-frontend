import { Tag } from "@chakra-ui/react";

export interface VersionTagProps {
  deployType: string;
}

export const VersionTag = ({ deployType }: VersionTagProps) => (
  <Tag
    fontWeight='600'
    bg={deployType === "dev" ? "purple" : "diamond.700"}
    color='diamond.50'
    borderRadius='0'
  >
    {deployType.toUpperCase()}
  </Tag>
);
