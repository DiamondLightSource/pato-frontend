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

const recipes = Object.keys(recipeTagMap);

/**
 * Check if recipe matches a given recipe type, or if it's not in the list of known recipe types.
 *
 * If it matches the target recipe type, return true, otherwise, only return true if it is an unknown recipe type.
 *
 * This is to maintain backwards compatibility with back when we had processing jobs with multiple autoprocessing
 * programs, but no separation between the different recipes.
 * @param target Target recipe type
 * @param procJob Processing job to check
 * @returns boolean
 */
const checkRecipe = (target: string, procJob: BaseProcessingJobProps["procJob"]) =>
  target === procJob.recipe ||
  (procJob.recipe && !Object.keys(recipeTagMap).includes(procJob.recipe));

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

  return (
    <AccordionItem>
      <ProcessingTitle autoProc={autoProc} procJob={procJob} status={status} />
      <AccordionPanel p={4} bg='diamond.75'>
        {autoProc ? (
          <>
            {active && (
              <Grid gap={3} templateColumns={{ base: "1", "2xl": "repeat(2, 1fr)" }}>
                {checkRecipe(recipes[0], procJob) && (
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
                {checkRecipe(recipes[1], procJob) && (
                  <Classification autoProcId={autoProc.autoProcProgramId} />
                )}
                {checkRecipe(recipes[2], procJob) && (
                  <Classification autoProcId={autoProc.autoProcProgramId} type='3d' />
                )}
                {checkRecipe(recipes[3], procJob) && (
                  <RefinementStep autoProcId={autoProc.autoProcProgramId} />
                )}
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
