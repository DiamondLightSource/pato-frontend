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
  jobParameters: { items: ReprocessingParameters; allowReprocessing: boolean };
}

const getSpaData = async (groupId: string) => {
  const response = await client.safeGet(includePage(`dataGroups/${groupId}/dataCollections`, 1, 1));
  const returnData = {
    collection: {
      info: [],
      comments: "",
      fileTemplate: "?",
      imageDirectory: "?",
    } as SpaCollectionData,
    jobs: null,
  };

  if (response.status === 200 && response.data.items) {
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
        buildEndpoint("processingJobs", { collectionId: parsedCollectionData.dataCollectionId.toString() }, 25, 1)
      );

      if (jobsResponse.status === 200 && jobsResponse.data.items) {
        const processingJobId = jobsResponse.data.items[0].ProcessingJob.processingJobId;
        const response = await client.get(`processingJob/${processingJobId}/parameters`);

        let legibleParameters =
          response.status === 200
            ? { allowReprocessing: response.data.allowReprocessing, ...parseJobParameters(response.data.items) }
            : {};

        // Ignore extraction step
        let jobsList: ProcessingJob[] = jobsResponse.data.items.filter(
          (job: ProcessingJob) => job.ProcessingJob.recipe !== "em-spa-extract"
        );

        /*
         * Sort items by recipe first, alphabetically, except for 3D classification jobs.
         * If a job is a 3D classification job, it should be displayed last.
         *
         * If two jobs have the same recipe, the processing job ID takes precedence.
         */
        jobsList.sort((a, b) => {
          if (a.ProcessingJob.recipe !== b.ProcessingJob.recipe) {
            if (a.ProcessingJob.recipe === "em-spa-class3d") {
              return 1;
            }

            if (b.ProcessingJob.recipe === "em-spa-class3d") {
              return -1;
            }

            return a.ProcessingJob.recipe > b.ProcessingJob.recipe ? -1 : 1;
          }

          if (a.ProcessingJob.processingJobId !== b.ProcessingJob.processingJobId) {
            return a.ProcessingJob.processingJobId > b.ProcessingJob.processingJobId ? 1 : -1;
          }

          return 0;
        });

        return {
          collection: parsedCollectionData,
          jobs: jobsList,
          jobParameters: legibleParameters,
        };
      }
    }
  }

  return returnData;
};

const queryBuilder = (groupId: string = "0") => ({
  queryKey: ["spaAutoProc", groupId],
  queryFn: () => getSpaData(groupId),
  staleTime: 60000,
});

export const spaLoader = (queryClient: QueryClient) => async (params: Params) => {
  const query = queryBuilder(params.groupId);
  return ((await queryClient.getQueryData(query.queryKey)) ?? (await queryClient.fetchQuery(query))) as SpaResponse;
};
