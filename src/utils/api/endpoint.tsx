import { Params } from "react-router-dom";

const buildEndpoint = (endpoint: string, params: Params): string => {
  switch (endpoint) {
    case "visits":
      return `${endpoint}/${params.propId}`;
    case "collections":
      return `${endpoint}/${params.visitId}`;
    default:
      return endpoint;
  }
};

export { buildEndpoint };
