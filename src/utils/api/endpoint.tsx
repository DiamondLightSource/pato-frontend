import { Params } from "react-router-dom";

const buildEndpoint = (endpoint: string, params: Params, itemsPerPage: number, page: number): string => {
  let builtEndpoint = `${endpoint}?limit=${itemsPerPage}&page=${page}`;
  switch (endpoint) {
    case "visits":
      return `proposals/${params.propId}/${builtEndpoint}`;
    case "dataGroups":
      return `visits/${params.visitId}/${builtEndpoint}`;
    default:
      return builtEndpoint;
  }
};

export { buildEndpoint };
