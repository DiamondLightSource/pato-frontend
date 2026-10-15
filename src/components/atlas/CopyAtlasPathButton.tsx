import { Button, Tooltip } from "@chakra-ui/react";
import { useMemo } from "react";
import { MdContentCopy } from "react-icons/md";

export interface CopyAtlasPathButtonProps {
  baseImagePath: string | null;
  fullPath?: boolean;
}

export const CopyAtlasPathButton = ({ baseImagePath, fullPath = true }: CopyAtlasPathButtonProps) => {
  const path = useMemo(() => baseImagePath
    ? fullPath
      ? baseImagePath
      : baseImagePath.substring(0, baseImagePath.lastIndexOf("/"))
    : null, [baseImagePath, fullPath]);

  const copyAtlasPath = () => {
    if (!path) {
      return;
    }

    navigator.clipboard.writeText(path);
  };

  return (
    path && (
      <Tooltip label={path}>
        <Button mx='20px' leftIcon={<MdContentCopy />} onClick={copyAtlasPath}>
          Copy Path
        </Button>
      </Tooltip>
    )
  );
};
