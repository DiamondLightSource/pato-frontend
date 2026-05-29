import { QueryClient } from "@tanstack/react-query";
import { Params } from "react-router";
import { components } from "schema/main";
import { client } from "utils/api/client";

export interface AtlasResponse {
  gridSquares: components["schemas"]["GridSquare"][] | null;
  atlas: components["schemas"]["Atlas"] | null;
  dataCollectionGroup: components["schemas"]["DataCollectionGroupSummaryResponse"];
}

const getAtlasData = async (groupId: string, searchParams: URLSearchParams) => {
  const [atlas, gridSquare, dcg] = await Promise.all([
    client.safeGet(`dataGroups/${groupId}/atlas`),
    client.safeGet(`dataGroups/${groupId}/grid-squares?${searchParams}&limit=3000`),
    client.safeGet(`dataGroups/${groupId}`),
  ]);

  return {
    gridSquares: atlas.status === 200 ? gridSquare.data.items : null,
    atlas: atlas.status === 200 ? atlas.data : null,
    dataCollectionGroup: dcg.data,
  };
};

const queryBuilder = (groupId: string, request: Request) => {
  const urlObj = new URL(request.url);

  return {
    queryKey: [
      "atlas",
      groupId,
      urlObj.searchParams.get("hideSquares"),
      urlObj.searchParams.get("hideEmptySearchMaps"),
    ],
    queryFn: () => getAtlasData(groupId, urlObj.searchParams),
    staleTime: 60000,
  };
};

const getAtlasCorrelationData = async (proposalReference: string, searchParams: URLSearchParams) => {
  console.log(searchParams)
  const response = await client.safeGet(`/proposals/${proposalReference}/data-collection-groups?atlasOnly=true&limit=10&${searchParams}`);

  if (response.status === 200) {
    return {...response.data, atlas: true};
  }

  return null;
}

const atlasCorrelationQueryBuilder = (proposalReference: string, request: Request) => {
  const urlObj = new URL(request.url);

  return {
    queryKey: [
      "atlasCorrelation",
      proposalReference,
      urlObj.searchParams.get("page"),
      urlObj.searchParams.get("limit"),
    ],
    queryFn: () => getAtlasCorrelationData(proposalReference, urlObj.searchParams),
    staleTime: 60000,
  };
};

export const atlasLoader =
  (queryClient: QueryClient) => async (request: Request, params: Params) => {
    const query = queryBuilder(params.groupId!, request);
    return ((await queryClient.getQueryData(query.queryKey)) ??
      (await queryClient.fetchQuery(query))) as AtlasResponse;
  };


  export const atlasCorrelationLoader =
  (queryClient: QueryClient) => async (request: Request, params: Params) => {
    const query = atlasCorrelationQueryBuilder(params.propId!, request);
    return ((await queryClient.getQueryData(query.queryKey)) ??
      (await queryClient.fetchQuery(query))) as AtlasResponse;
  };