import { AccordionItem, AccordionPanel, Grid, GridItem } from "@chakra-ui/react";
import { Motion } from "components/motion/motion";
import { useState } from "react";
import { Classification } from "components/spa/classification";
import { ParticlePicking } from "components/spa/particlePicking";
import { CTF } from "components/ctf/ctf";
import { ProcessingTitle } from "components/visualisation/processingTitle";
import { BaseProcessingJobProps } from "schema/interfaces";

const SPA = ({ autoProc, procJob, status, active }: BaseProcessingJobProps) => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number | undefined>();

  return (
    <AccordionItem>
      <ProcessingTitle autoProc={autoProc} procJob={procJob} status={status} />
      <AccordionPanel p={0}>
        {active && (
          <Grid gap={3} bg='diamond.75' p={4} templateColumns={{ "base": "", "2xl": "repeat(2, 1fr)" }}>
            <GridItem>
              <CTF onGraphClicked={setPage} parentId={autoProc.autoProcProgramId} parentType='autoProc' />
            </GridItem>
            <Motion
              page={page}
              onPageChanged={setPage}
              onTotalChanged={setTotal}
              parentType='autoProc'
              parentId={autoProc.autoProcProgramId}
            />
            <ParticlePicking autoProcId={autoProc.autoProcProgramId} page={page} total={total} />
            <Classification autoProcId={autoProc.autoProcProgramId} />
            <Classification autoProcId={autoProc.autoProcProgramId} type='3d' />
          </Grid>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export { SPA };
