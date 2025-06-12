import { Params, createSearchParams } from "react-router";

export const includePage = (
  endpoint: string,
  limit: number,
  page: number,
  search?: string,
  sortBy?: string | null
) => {
  const searchParams = createSearchParams({ page: (page - 1).toString(), limit: limit.toString() });

  // Empty searches should still be allowed
  if (search !== undefined) {
    searchParams.set("search", search);
  }

  if (sortBy) {
    searchParams.set("sortBy", sortBy);
  }

  let newEndpoint = `${endpoint}${endpoint.includes("?") ? "&" : "?"}${searchParams}`;

  return newEndpoint;
};

export const buildEndpoint = (
  endpoint: string,
  params: Params,
  limit: number,
  page: number,
  search?: string,
  sortBy?: string | null
): string => {
  let builtEndpoint = includePage(endpoint, limit, page, search, sortBy);
  switch (endpoint) {
    case "sessions":
      return `${builtEndpoint}&proposal=${params.propId}&countCollections=true`;
    case "dataCollections":
      return `dataGroups/${params.groupId}/${builtEndpoint}`;
    case "processingJobs":
      return `dataCollections/${params.collectionId}/${builtEndpoint}`;
    default:
      return builtEndpoint;
  }
};
