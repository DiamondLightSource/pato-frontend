import {
  AccordionItem,
  AccordionPanel,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import { Motion } from "../motion/motion";
import { useCallback, useState } from "react";
import { Classification } from "./classification";
import { ParticlePicking } from "./particlePicking";
import { CTF } from "../ctf/ctf";
import { ProcessingTitle } from "../visualisation/processingTitle";
import { BaseProcessingJobProps } from "../../schema/interfaces";


const SPA = ({ autoProc, procJob, status, active }: BaseProcessingJobProps) => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number | undefined>();

  const handlePageChanged = useCallback((_: any, newPage: number) => {
    setPage(newPage);
  }, []);

  const handleGraphClicked = useCallback((x: number) => {
    setPage(x);
  }, []);

  return (
    <AccordionItem>
      <ProcessingTitle autoProc={autoProc} procJob={procJob} status={status} />
      <AccordionPanel p={0}>
        {active && (
          <Grid gap={3} bg='diamond.75' p={4}>
            <GridItem>
              <CTF onGraphClicked={handleGraphClicked} parentId={autoProc.autoProcProgramId} parentType='autoProc' />
            </GridItem>
            <Motion
              currentPage={page}
              onMotionChanged={handlePageChanged}
              onTotalChanged={setTotal}
              parentType='autoProc'
              parentId={autoProc.autoProcProgramId}
            />
            <ParticlePicking autoProcId={autoProc.autoProcProgramId} currentPage={page} total={total} />
            <Classification autoProcId={autoProc.autoProcProgramId} />
            <Classification autoProcId={autoProc.autoProcProgramId} type='3d' />
          </Grid>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export { SPA };
