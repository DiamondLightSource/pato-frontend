import { QueryClient } from "@tanstack/react-query";
import { Params } from "react-router-dom";
import { components } from "schema/main";
import { client } from "utils/api/client";

export interface AtlasResponse {
  gridSquares: components["schemas"]["GridSquare"][];
  atlas: components["schemas"]["Atlas"];
}

const getAtlasData = async (groupId: string) => {
  const [atlas, gridSquare] = await Promise.all([
    client.safeGet(`dataGroups/${groupId}/atlas`),
    client.safeGet(`dataGroups/${groupId}/grid-squares?limit=3000`),
  ]);

  return { gridSquares: gridSquare.data.items, atlas: atlas.data };
};

const queryBuilder = (groupId: string) => ({
  queryKey: ["atlas", groupId],
  queryFn: () => getAtlasData(groupId),
  staleTime: 60000,
});

export const atlasLoader = (queryClient: QueryClient) => async (params: Params) => {
  const query = queryBuilder(params.groupId!);
  return ((await queryClient.getQueryData(query.queryKey)) ??
    (await queryClient.fetchQuery(query))) as AtlasResponse;
};
