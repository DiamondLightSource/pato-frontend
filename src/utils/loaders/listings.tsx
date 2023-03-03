import { Params } from "react-router-dom";
import { components } from "../../schema/main";
import { client } from "../api/client";
import { buildEndpoint } from "../api/endpoint";
import { parseDate } from "../generic";

type ProcessDataCallback = (data: Record<string, any>[]) => Record<string, any>[];
type Session = components["schemas"]["SessionResponse"];

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

const fixAllDates = (sessions: Session[]) =>
  sessions.map((session) =>
    Object.assign({}, session, { startDate: parseDate(session.startDate), endDate: parseDate(session.endDate) })
  );

const getSessionData = async () => {
  const currentDate = new Date().toISOString();
  const responses = await Promise.all(
    [
      "sessions?limit=5&page=0&search=m",
      `sessions?limit=5&page=0&search=m&minEndDate=${currentDate}&maxStartDate=${currentDate}`,
    ].map((url) => client.get(url).then((r) => r))
  );

  if (responses.some((r) => r.status !== 200)) {
    return null;
  }

  return { recent: fixAllDates(responses[0].data.items), current: fixAllDates(responses[1].data.items) };
};

export { getListingData, getSessionData };
