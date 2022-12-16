import { Params } from "react-router-dom";

const buildEndpoint = (endpoint: string, params: Params, itemsPerPage: number, page: number): string => {
  let builtEndpoint = `${endpoint}?limit=${itemsPerPage}&page=${page - 1}`;
  switch (endpoint) {
    case "sessions":
      return `proposals/${params.propId}/${builtEndpoint}`;
    case "dataGroups":
      return `sessions/${params.visitId}/${builtEndpoint}`;
    case "collections":
      return `dataGroups/${params.groupId}/${builtEndpoint}`;
    default:
      return builtEndpoint;
  }
};

export { buildEndpoint };
