import { QueryClient } from "@tanstack/react-query";
import { Params } from "react-router";
import { ParsedSessionReponse } from "schema/interfaces";
import { components } from "schema/main";
import { client } from "utils/api/client";
import { includePage } from "utils/api/endpoint";
import { parseSessionData } from "utils/api/response";
import { getUser, UserWithEmail } from "loaders/user";

type PagedGroups = components["schemas"]["Paged_DataCollectionGroupSummaryResponse_"];

export interface SessionDataResponse extends PagedGroups {
  session: ParsedSessionReponse;
  user: UserWithEmail | null;
}

const sessionQueryBuilder = (request: Request, params: Params<string>) => {
  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get("search") || "";
  const items = searchParams.get("items") || "20";
  const page = searchParams.get("page") || "1";

  return {
    queryKey: ["dataGroups", search, items, page, params],
    queryFn: async () => getListingData(params, items, page, search),
    staleTime: 60000,
  };
};

const getListingData = async (
  params: Params<string>,
  items: string,
  page: string,
  search: string
) => {
  const builtEndpoint = includePage(
    `proposals/${params.propId}/sessions/${params.visitId}/dataGroups`,
    parseInt(items),
    parseInt(page),
    search
  );

  const response = await client.safeGet(builtEndpoint);
  const sessionResponse = await client.safeGet(
    `proposals/${params.propId}/sessions/${params.visitId}`
  );

  if (sessionResponse.status !== 200) {
    return null;
  }

  const session = parseSessionData(sessionResponse.data);

  if (response.status !== 200) {
    return { total: 0, items: [], limit: 20, session };
  }

  const user = await getUser();

  return { ...(response.data as PagedGroups), session, user };
};

export const sessionPageLoader =
  (queryClient: QueryClient) => async (request: Request, params: Params<string>) => {
    const query = sessionQueryBuilder(request, params);
    const data: SessionDataResponse =
      queryClient.getQueryData(query.queryKey) ?? (await queryClient.fetchQuery(query));

    if (data) {
      return data;
    }

    return { items: null, total: 0, limit: 20, session: null };
  };

export const handleGroupClicked = (item: Record<string, string | number>) => {
  switch (item.experimentTypeName) {
    case "Single Particle":
      return `groups/${item.dataCollectionGroupId}/spa`;
    case "Tomogram":
      return `groups/${item.dataCollectionGroupId}/tomograms/1`;
    default:
      if (item.experimentType === "tomo") {
        return `groups/${item.dataCollectionGroupId}/tomograms/1`;
      }
      return `groups/${item.dataCollectionGroupId}/spa`;
  }
};
