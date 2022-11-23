import { Params } from "react-router-dom";

const buildEndpoint = (endpoint: string, params: Params, itemsPerPage: number, page: number): string => {
  let builtEndpoint = `${endpoint}?limit=${itemsPerPage}&page=${page}`;
  switch (endpoint) {
    case "visits":
      return `${builtEndpoint}&prop=${params.propId}`;
    case "dataCollectionGroups":
      return `${builtEndpoint}&visit=${params.visitId}`;
    default:
      return builtEndpoint;
  }
};

export { buildEndpoint };
