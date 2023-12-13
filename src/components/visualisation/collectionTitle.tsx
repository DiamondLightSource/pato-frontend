import { HStack, Heading, Link } from "@chakra-ui/layout";
import { Tag, TagLeftIcon, TagLabel, TagProps } from "@chakra-ui/tag";
import { Tooltip } from "@chakra-ui/tooltip";
import { MdInfoOutline } from "react-icons/md";

export interface CollectionTitleProps {
  title?: string | null;
  type: "SPA" | "Tomogram";
  colorScheme: TagProps["colorScheme"];
}

const CollectionTitle = ({ title, type, colorScheme }: CollectionTitleProps) => (
  <HStack>
    <Heading>{title ?? "Data Collection"}</Heading>
    <Tooltip label='About Processing'>
      <Tag
        colorScheme={colorScheme}
        as={Link}
        href={`/about#${type.toLowerCase()}`}
        textDecor='underline'
      >
        <TagLeftIcon as={MdInfoOutline} />
        <TagLabel>{type}</TagLabel>
      </Tag>
    </Tooltip>
  </HStack>
);

export { CollectionTitle };
