import { AccordionItem, AccordionPanel, Grid } from "@chakra-ui/react";
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
      <AccordionPanel p={4} bg='diamond.75'>
        {active && (
          <Grid gap={3} templateColumns={{ base: "1", "2xl": "repeat(2, 1fr)" }}>
            <CTF
              onGraphClicked={setPage}
              parentId={autoProc.autoProcProgramId}
              parentType='autoProc'
            />
            <Motion
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
