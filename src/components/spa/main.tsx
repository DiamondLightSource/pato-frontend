import { AccordionItem, AccordionPanel, Grid } from "@chakra-ui/react";
import { Motion } from "components/motion/motion";
import { useMemo, useState } from "react";
import { Classification } from "components/spa/classification";
import { ParticlePicking } from "components/spa/particlePicking";
import { CTF } from "components/ctf/ctf";
import { ProcessingTitle } from "components/visualisation/processingTitle";
import { BaseProcessingJobProps } from "schema/interfaces";
import { recipeTagMap } from "utils/config/parse";

const checkRecipe = (target: string, procJob: BaseProcessingJobProps["procJob"]) =>
  target === procJob.recipe ||
  !(procJob.recipe, Object.keys(recipeTagMap).includes(procJob.recipe));

const SPA = ({ autoProc, procJob, status, active }: BaseProcessingJobProps) => {
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState<number | undefined>();

  const toDisplay = useMemo(
    () =>
      ["em-spa-preprocess", "em-spa-class2d", "em-spa-class3d"].map((target) =>
        checkRecipe(target, procJob)
      ),
    [procJob]
  );

  return (
    <AccordionItem>
      <ProcessingTitle autoProc={autoProc} procJob={procJob} status={status} />
      <AccordionPanel p={4} bg='diamond.75'>
        {active && (
          <Grid gap={3} templateColumns={{ base: "1", "2xl": "repeat(2, 1fr)" }}>
            {toDisplay[0] && (
              <>
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
                <ParticlePicking
                  autoProcId={autoProc.autoProcProgramId}
                  page={page}
                  total={total}
                />
              </>
            )}
            {toDisplay[1] && <Classification autoProcId={autoProc.autoProcProgramId} />}
            {toDisplay[2] && <Classification autoProcId={autoProc.autoProcProgramId} type='3d' />}
          </Grid>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export { SPA };
