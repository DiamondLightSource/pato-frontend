import { Button } from "@chakra-ui/react";
import { MdContentCopy } from "react-icons/md";

export interface CopyAtlasPathButtonProps {
  baseImagePath: string | null;
}

export const CopyAtlasPathButton = ({ baseImagePath }: CopyAtlasPathButtonProps) => {
  const copyAtlasPath = () => {
    if (!baseImagePath) {
      return;
    }

    navigator.clipboard.writeText(baseImagePath.substring(0, baseImagePath.lastIndexOf("/")));
  };

  return (
    baseImagePath && (
      <Button mx="20px" leftIcon={<MdContentCopy />} onClick={copyAtlasPath}>
        Copy Path
      </Button>
    )
  );
};
