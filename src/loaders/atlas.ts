import { QueryClient } from "@tanstack/react-query";
import { Params } from "react-router";
import { components } from "schema/main";
import { client } from "utils/api/client";

export interface AtlasResponse {
  gridSquares: components["schemas"]["GridSquare"][];
  atlas: components["schemas"]["Atlas"];
  dataCollectionGroup: components["schemas"]["DataCollectionGroupSummaryResponse"];
}

const getAtlasData = async (groupId: string, searchParams: URLSearchParams) => {
  const [atlas, gridSquare, dcg] = await Promise.all([
    client.safeGet(`dataGroups/${groupId}/atlas`),
    client.safeGet(`dataGroups/${groupId}/grid-squares?${searchParams}&limit=3000`),
    client.safeGet(`dataGroups/${groupId}`),
  ]);

  return { gridSquares: gridSquare.data.items, atlas: atlas.data, dataCollectionGroup: dcg.data };
};

const queryBuilder = (groupId: string, request: Request) => {
  const urlObj = new URL(request.url);

  return {
    queryKey: ["atlas", groupId, urlObj.searchParams.get("hideSquares")],
    queryFn: () => getAtlasData(groupId, urlObj.searchParams),
    staleTime: 60000,
  };
};

export const atlasLoader =
  (queryClient: QueryClient) => async (request: Request, params: Params) => {
    const query = queryBuilder(params.groupId!, request);
    return ((await queryClient.getQueryData(query.queryKey)) ??
      (await queryClient.fetchQuery(query))) as AtlasResponse;
  };
