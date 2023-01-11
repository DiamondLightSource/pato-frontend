import { Params } from "react-router-dom";

const buildEndpoint = (endpoint: string, params: Params, itemsPerPage: number, page: number): string => {
  let builtEndpoint = `${endpoint}?limit=${itemsPerPage}&page=${page - 1}`;
  switch (endpoint) {
    case "sessions":
      return `${builtEndpoint}&proposal=${params.propId}`;
    case "dataGroups":
      return `${builtEndpoint}&proposal=${params.propId}&session=${params.visitId}`;
    case "dataCollections":
      return `${builtEndpoint}&groupId=${params.groupId}`;
    case "processingJobs":
      return `dataCollections/${params.collectionId}/${builtEndpoint}`;
    default:
      return builtEndpoint;
  }
};

export { buildEndpoint };
