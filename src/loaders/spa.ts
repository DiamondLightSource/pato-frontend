import { QueryClient } from "@tanstack/react-query";
import { Params } from "react-router-dom";
import { DataConfig, SpaCollectionData } from "schema/interfaces";
import { components } from "schema/main";
import { client } from "utils/api/client";
import { buildEndpoint, includePage } from "utils/api/endpoint";
import { parseJobParameters } from "utils/api/response";
import { collectionConfig } from "utils/config/parse";
import { parseData } from "utils/generic";

type DataCollection = components["schemas"]["DataCollectionSummary"];
type ProcessingJob = components["schemas"]["ProcessingJobResponse"];
type ReprocessingParameters = Partial<components["schemas"]["SPAReprocessingParameters"]>;

const spaCollectionConfig: DataConfig = {
  include: [
    ...collectionConfig.include,
    ...[
      { name: "totalExposedDose", label: "Total Dose", unit: "e⁻/Å²" },
      { name: "exposureTime", label: "Total Exposure Time", unit: "seconds" },
      { name: "phasePlate", label: "Phase Plate Used" },
      { name: "c2aperture", label: "C2 Aperture", unit: "μm" },
      { name: "magnification" },
      {
        name: ["beamSizeAtSampleX, beamSizeAtSampleY"],
        unit: "μm",
        label: "Illuminated Area",
      },
      {
        name: "slitGapHorizontal",
        label: "Energy Filter / Slit Width",
        unit: "eV",
      },
    ],
  ],
  root: [...collectionConfig.root!, "fileTemplate", "imageDirectory"],
};

const getAcquisitionSoftware = (fileTemplate: string | null) => {
  if (!fileTemplate) {
    return "";
  }

  if (fileTemplate.includes("GridSquare_")) {
    return "EPU";
  }

  if (fileTemplate.includes("Frames/")) {
    return "SerialEM";
  }

  return "";
};

export interface SpaResponse {
  collection: SpaCollectionData;
  jobs: ProcessingJob[] | null;
  allowReprocessing: boolean;
  jobParameters: { items: ReprocessingParameters };
}

const recipeOrder = ["em-spa-preprocess", "em-spa-class2d", "em-spa-class3d", "em-spa-refine"];

const getSpaData = async (groupId: string, propId: string, sessionId: string) => {
  const response = await client.safeGet(includePage(`dataGroups/${groupId}/dataCollections`, 1, 1));

  // Tick autocalculation by default
  const returnData: SpaResponse = {
    collection: {
      info: [],
      comments: "",
      fileTemplate: "?",
      imageDirectory: "?",
    } as SpaCollectionData,
    jobs: null,
    allowReprocessing: false,
    jobParameters: {
      items: { performCalculation: true, doClass2D: true, doClass3D: true, useCryolo: true },
    },
  };

  if (response.status === 200 && response.data.items) {
    const allowReprocessingResponse = await client.safeGet(
      `proposals/${propId}/sessions/${sessionId}/reprocessingEnabled`
    );

    if (allowReprocessingResponse.status === 200) {
      returnData.allowReprocessing = allowReprocessingResponse.data.allowReprocessing;
    }

    const data = response.data.items[0] as DataCollection;

    const parsedCollectionData = parseData(data, spaCollectionConfig) as SpaCollectionData;

    parsedCollectionData.info.unshift({
      label: "Acquisition Software",
      value: getAcquisitionSoftware(data.fileTemplate),
    });
    parsedCollectionData.info.push({
      label: "Comments",
      value: data.comments ?? "",
      wide: true,
    });

    returnData.collection = parsedCollectionData;

    if (parsedCollectionData.dataCollectionId) {
      const jobsResponse = await client.safeGet(
        buildEndpoint(
          "processingJobs",
          { collectionId: parsedCollectionData.dataCollectionId.toString() },
          25,
          1
        )
      );

      if (jobsResponse.status === 200 && jobsResponse.data.items) {
        const processingJobId = jobsResponse.data.items[0].ProcessingJob.processingJobId;
        const response = await client.get(`processingJob/${processingJobId}/parameters`);

        if (response.status === 200) {
          returnData.jobParameters = {
            items: {
              ...returnData.jobParameters.items,
              ...parseJobParameters(response.data.items),
            },
          };
        }

        // Ignore extraction step
        let jobsList: ProcessingJob[] = jobsResponse.data.items.filter(
          (job: ProcessingJob) => "em-spa-extract" !== job.ProcessingJob.recipe
        );

        /*
         * Sort items by recipe first, alphabetically, except for 3D classification jobs.
         * If a job is a 3D classification job, it should be displayed last.
         *
         * If two jobs have the same recipe, the processing job ID takes precedence.
         */
        jobsList.sort((a, b) => {
          if (a.ProcessingJob.recipe !== b.ProcessingJob.recipe) {
            return recipeOrder.indexOf(a.ProcessingJob.recipe) >
              recipeOrder.indexOf(b.ProcessingJob.recipe)
              ? 1
              : -1;
          }

          if (a.ProcessingJob.processingJobId !== b.ProcessingJob.processingJobId) {
            return a.ProcessingJob.processingJobId > b.ProcessingJob.processingJobId ? 1 : -1;
          }

          return 0;
        });

        returnData.jobs = jobsList;
      }
    }
  }

  return returnData;
};

const queryBuilder = (groupId: string = "0", propId: string, sessionId: string) => ({
  // Since the groupId is already unique, and implicates a single parent session, proposal/session data
  // does not need to be included in query keys
  queryKey: ["spaAutoProc", groupId],
  queryFn: () => getSpaData(groupId, propId, sessionId),
  staleTime: 60000,
});

export const spaLoader = (queryClient: QueryClient) => async (params: Params) => {
  const query = queryBuilder(params.groupId, params.propId!, params.visitId!);
  return ((await queryClient.getQueryData(query.queryKey)) ??
    (await queryClient.fetchQuery(query))) as SpaResponse;
};
