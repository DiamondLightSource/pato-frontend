import { Params } from "react-router-dom";

export const includePage = (endpoint: string, limit: number, page: number) =>
  `${endpoint}${endpoint.includes("?") ? "&" : "?"}page=${page - 1}&limit=${limit}`;

export const buildEndpoint = (endpoint: string, params: Params, limit: number, page: number): string => {
  let builtEndpoint = includePage(endpoint, limit, page);
  switch (endpoint) {
    case "sessions":
      return `${builtEndpoint}&proposal=${params.propId}&countCollections=true`;
    case "dataGroups":
      return `${builtEndpoint}&proposal=${params.propId}&session=${params.visitId}`;
    case "dataCollections":
      return `dataGroups/${params.groupId}/${builtEndpoint}`;
    case "processingJobs":
      return `dataCollections/${params.collectionId}/${builtEndpoint}`;
    default:
      return builtEndpoint;
  }
};
