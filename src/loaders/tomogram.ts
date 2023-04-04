import { Params, redirect } from "react-router-dom";
import { CollectionData } from "schema/interfaces";
import { client } from "utils/api/client";
import { includePage } from "utils/api/endpoint";
import { collectionConfig } from "utils/config/parse";
import { parseData } from "utils/generic";
import { components } from "schema/main";
import { QueryClient } from "@tanstack/react-query";

type ProcessingJob = components["schemas"]["ProcessingJobResponse"];

interface TomogramData {
  collection: CollectionData;
  total: number;
  page: number;
  jobs: ProcessingJob[] | null;
}

export interface TomogramResponse {
  collection: CollectionData;
  total: number;
  page: number;
  jobs: ProcessingJob[] | null;
}

const getTomogramData = async (
  groupId: string,
  collectionIndex: string,
  onlyTomograms: boolean,
  request: Request
) => {
  const returnData: TomogramData = {
    collection: {
      info: [],
      comments: "",
      fileTemplate: "?",
      imageDirectory: "?",
    } as CollectionData,
    total: 1,
    page: 1,
    jobs: null,
  };

  const collectionResponse = await client.safeGet(
    includePage(
      `dataGroups/${groupId}/dataCollections?onlyTomograms=${onlyTomograms}`,
      1,
      parseInt(collectionIndex)
    )
  );

  if (collectionResponse.status !== 200) {
    return returnData;
  }

  if (collectionIndex > collectionResponse.data.total) {
    return redirect(
      `${request.url
        .split("/")
        .slice(0, -1)
        .join("/")}/1?onlyTomograms=${onlyTomograms}`
    );
  }

  if (
    collectionResponse.status === 200 &&
    collectionResponse.data.total &&
    collectionResponse.data.items
  ) {
    returnData.total = collectionResponse.data.total;

    returnData.collection = parseData(
      collectionResponse.data.items[0],
      collectionConfig
    ) as CollectionData;

    const jobsResponse = await client.safeGet(
      `dataCollections/${collectionResponse.data.items[0].dataCollectionId}/processingJobs?limit=3`
    );
    if (jobsResponse.status === 200 && jobsResponse.data) {
      const items = jobsResponse.data.items;
      returnData.jobs = items;
    }
  }

  return returnData;
};

const queryBuilder = (
  groupId: string = "0",
  collectionIndex: string = "1",
  request: Request
) => {
  const onlyTomograms =
    new URL(request.url).searchParams.get("onlyTomograms") === "true";
  return {
    queryKey: ["tomogramAutoProc", groupId, collectionIndex, onlyTomograms],
    queryFn: () =>
      getTomogramData(groupId, collectionIndex, onlyTomograms, request),
    staleTime: 60000,
  };
};

export const tomogramLoader =
  (queryClient: QueryClient) => async (params: Params, request: Request) => {
    const query = queryBuilder(params.groupId, params.collectionIndex, request);
    return ((await queryClient.getQueryData(query.queryKey)) ??
      (await queryClient.fetchQuery(query))) as TomogramResponse;
  };
