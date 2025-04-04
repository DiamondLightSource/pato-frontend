import { QueryClient } from "@tanstack/react-query";
import { Params } from "react-router";
import { client } from "utils/api/client";
import { buildEndpoint } from "utils/api/endpoint";

type ProcessDataCallback = (data: Record<string, any>[]) => Record<string, any>[];

const listingQueryBuilder = (request: Request, params: Params<string>, endpoint: string) => {
  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get("search") || "";
  const items = searchParams.get("items") || "20";
  const page = searchParams.get("page") || "1";
  const sortBy = searchParams.get("sortBy");

  const builtEndpoint = buildEndpoint(
    `${endpoint}`,
    params,
    parseInt(items),
    parseInt(page),
    search,
    sortBy
  );

  return {
    queryKey: [endpoint, search, items, page, sortBy, params],
    queryFn: async () => getListingData(builtEndpoint),
    staleTime: 60000,
  };
};

const getListingData = async (endpoint: string) => {
  const response = await client.safeGet(endpoint);

  if (response.status === 200) {
    return response.data;
  }

  return null;
};

export const listingLoader =
  <T extends Record<string, any>>(queryClient: QueryClient) =>
  async (
    request: Request,
    params: Params<string>,
    endpoint: string,
    processData?: ProcessDataCallback
  ) => {
    const query = listingQueryBuilder(request, params, endpoint);
    const data = queryClient.getQueryData(query.queryKey) ?? (await queryClient.fetchQuery(query));

    if (data && data.items !== undefined) {
      return {
        data: (processData ? processData(data.items) : data.items) as T[],
        total: data.total,
        limit: data.limit,
      };
    }

    return { data: null, total: 0, limit: 20 };
  };
