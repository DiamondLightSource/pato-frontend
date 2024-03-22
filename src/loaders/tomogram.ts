import { Params, redirect } from "react-router-dom";
import { CollectionData } from "schema/interfaces";
import { client } from "utils/api/client";
import { includePage } from "utils/api/endpoint";
import { collectionConfig } from "utils/config/parse";
import { parseData } from "utils/generic";
import { components } from "schema/main";
import { QueryClient } from "@tanstack/react-query";

type TomogramFullResponse = components["schemas"]["TomogramFullResponse"];

export interface TomogramResponse {
  /** Data collection */
  collection: CollectionData;
  total: number;
  page: number;
  /** Tomograms belonging to data collection (one per autoproc program) */
  tomograms: TomogramFullResponse[] | null;
  allowReprocessing: boolean;
}

const getTomogramData = async (
  groupId: string,
  propId: string,
  sessionId: string,
  collectionIndex: string,
  searchParams: URLSearchParams,
  request: Request
) => {
  const returnData: TomogramResponse = {
    collection: {
      info: [],
      comments: "",
      fileTemplate: "?",
      imageDirectory: "?",
    } as CollectionData,
    total: 1,
    page: 1,
    tomograms: null,
    allowReprocessing: false,
  };

  const collectionResponse = await client.safeGet(
    includePage(
      `dataGroups/${groupId}/dataCollections?${searchParams}`,
      1,
      parseInt(collectionIndex)
    )
  );

  const reprocessingResponse = await client.safeGet(
    `proposals/${propId}/sessions/${sessionId}/reprocessingEnabled`
  );

  if (reprocessingResponse.status === 200) {
    returnData.allowReprocessing = reprocessingResponse.data.allowReprocessing;
  }

  if (collectionResponse.status !== 200) {
    return returnData;
  }

  if (collectionIndex > collectionResponse.data.total) {
    return redirect(`${request.url.split("/").slice(0, -1).join("/")}/1?${searchParams}`);
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

    const tomogramsResponse = await client.safeGet(
      `dataCollections/${collectionResponse.data.items[0].dataCollectionId}/tomograms`
    );

    if (tomogramsResponse.status === 200 && tomogramsResponse.data) {
      const items = tomogramsResponse.data.items;
      returnData.tomograms = items;
    }
  }

  return returnData;
};

const queryBuilder = (
  groupId: string = "0",
  propId: string,
  sessionId: string,
  collectionIndex: string = "1",
  request: Request
) => {
  const urlObj = new URL(request.url);

  // Since the groupId is already unique, and implicates a single parent session, proposal/session data
  // does not need to be included in query keys
  return {
    queryKey: ["tomogramAutoProc", groupId, collectionIndex, urlObj.searchParams.toString()],
    queryFn: () =>
      getTomogramData(groupId, propId, sessionId, collectionIndex, urlObj.searchParams, request),
    staleTime: 60000,
  };
};

export const tomogramLoader =
  (queryClient: QueryClient) => async (params: Params, request: Request) => {
    const query = queryBuilder(
      params.groupId,
      params.propId!,
      params.visitId!,
      params.collectionIndex,
      request
    );
    return ((await queryClient.getQueryData(query.queryKey)) ??
      (await queryClient.fetchQuery(query))) as TomogramResponse;
  };
