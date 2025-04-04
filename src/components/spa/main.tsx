import { AccordionItem, AccordionPanel, Grid, Text } from "@chakra-ui/react";
import { Motion } from "components/motion/motion";
import { useCallback, useMemo, useState } from "react";
import { Classification } from "components/spa/classification";
import { ParticlePicking } from "components/spa/particlePicking";
import { CTF } from "components/ctf/ctf";
import { ProcessingTitle } from "components/visualisation/processingTitle";
import { BaseProcessingJobProps } from "schema/interfaces";
import { recipeTagMap } from "utils/config/parse";
import { RefinementStep } from "./refine";
import { useSearchParams } from "react-router";

// TODO: rework this, since we're no longer filtering out certain processing job types
const checkRecipe = (target: string, procJob: BaseProcessingJobProps["procJob"]) =>
  target === procJob.recipe ||
  (procJob.recipe && !(procJob.recipe, Object.keys(recipeTagMap).includes(procJob.recipe)));

const SPA = ({ autoProc, procJob, status, active }: BaseProcessingJobProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [total, setTotal] = useState(0);

  const setPage = useCallback(
    (page: number) => {
      setSearchParams((prev) => ({ ...prev, movie: page }));
    },
    [setSearchParams]
  );

  const page = useMemo(() => {
    const movie = searchParams.get("movie");

    if (movie && total) {
      const intMovie = parseInt(movie);
      if (isNaN(intMovie) || intMovie > total) return undefined;
      return intMovie;
    }

    return undefined;
  }, [searchParams, total]);

  const toDisplay = useMemo(
    () =>
      ["em-spa-preprocess", "em-spa-class2d", "em-spa-class3d", "em-spa-refine"].map((target) =>
        checkRecipe(target, procJob)
      ),
    [procJob]
  );

  return (
    <AccordionItem>
      <ProcessingTitle autoProc={autoProc} procJob={procJob} status={status} />
      <AccordionPanel p={4} bg='diamond.75'>
        {autoProc ? (
          <>
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
                      page={page}
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
                {toDisplay[2] && (
                  <Classification autoProcId={autoProc.autoProcProgramId} type='3d' />
                )}
                {toDisplay[3] && <RefinementStep autoProcId={autoProc.autoProcProgramId} />}
              </Grid>
            )}
          </>
        ) : (
          <Text>
            This processing job has no autoprocessing program associated with it. No data can be
            displayed.
          </Text>
        )}
      </AccordionPanel>
    </AccordionItem>
  );
};

export { SPA };
