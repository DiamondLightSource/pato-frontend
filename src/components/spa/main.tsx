import { Box } from "@chakra-ui/react";
import { Motion } from "../motion/motion";
import { useCallback, useState } from "react";
import { Class2d } from "./class2d";
import { ParticlePicking } from "./particlePicking";
import { CTF } from "../ctf/ctf";

interface SpaProps {
  /* Parent autoprocessing program ID*/
  autoProcId: number;
}

const SPA = ({ autoProcId }: SpaProps) => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number | undefined>();

  const handlePageChanged = useCallback((_: any, newPage: number) => {
    setPage(newPage);
  }, []);

  return (
    <Box p={4}>
      <CTF parentId={autoProcId} parentType='autoProc' />
      <Motion
        onMotionChanged={handlePageChanged}
        onTotalChanged={setTotal}
        parentType='autoProc'
        parentId={autoProcId}
      />
      <ParticlePicking autoProcId={autoProcId} page={page} total={total} />
      <Class2d autoProcId={autoProcId} />
    </Box>
  );
};

export default SPA;
