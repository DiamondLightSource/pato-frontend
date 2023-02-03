import { Params } from "react-router-dom";
import { client } from "../api/client";
import { buildEndpoint } from "../api/endpoint";

type ProcessDataCallback = (data: Record<string, any>[]) => Record<string, any>[];

const getListingData = async (
  request: Request,
  params: Params<string>,
  endpoint: string,
  processData?: ProcessDataCallback
) => {
  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get("search");
  const items = searchParams.get("items") || "20";
  const page = searchParams.get("page") || "1";

  let builtEndpoint = buildEndpoint(`${endpoint}`, params, parseInt(items), parseInt(page));

  if (search) {
    builtEndpoint += `&search=${search}`;
  }

  const response = await client.safe_get(builtEndpoint);
  if (response.data && response.data.items !== undefined) {
    return { data: processData ? processData(response.data.items) : response.data.items, total: response.data.total };
  }

  return { data: null, total: 0 };
};

const getSessionData = async () => {
  const response = await client.get("sessions?limit=5&page=0&search=m");
  if (response.status === 200) {
    return response.data.items;
  }

  return null;
};

export { getListingData, getSessionData };
