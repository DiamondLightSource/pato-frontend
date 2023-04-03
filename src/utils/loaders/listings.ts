import { QueryClient } from "@tanstack/react-query";
import { Params } from "react-router-dom";
import { components } from "schema/main";
import { client } from "utils/api/client";
import { buildEndpoint } from "utils/api/endpoint";
import { parseDate } from "utils/generic";

type ProcessDataCallback = (data: Record<string, any>[]) => Record<string, any>[];
type Session = components["schemas"]["SessionResponse"];

const listingQueryBuilder = (request: Request, params: Params<string>, endpoint: string) => {
  const searchParams = new URL(request.url).searchParams;
  const search = searchParams.get("search") || "";
  const items = searchParams.get("items") || "20";
  const page = searchParams.get("page") || "1";

  let builtEndpoint = buildEndpoint(`${endpoint}`, params, parseInt(items), parseInt(page));
  if (search) {
    builtEndpoint += `&search=${search}`;
  }

  return {
    queryKey: [endpoint, search, items, page, params],
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

const listingLoader =
  (queryClient: QueryClient) =>
  async (request: Request, params: Params<string>, endpoint: string, processData?: ProcessDataCallback) => {
    const query = listingQueryBuilder(request, params, endpoint);
    const data = queryClient.getQueryData(query.queryKey) ?? (await queryClient.fetchQuery(query));

    if (data && data.items !== undefined) {
      return { data: processData ? processData(data.items) : data.items, total: data.total };
    }

    return { data: null, total: 0 };
  };

const fixAllDates = (sessions: Session[]) =>
  sessions.map((session) =>
    Object.assign({}, session, { startDate: parseDate(session.startDate), endDate: parseDate(session.endDate) })
  );

const getSessionData = async () => {
  const currentDate = new Date();
  const daysAgoDate = new Date();
  daysAgoDate.setDate(currentDate.getDate() - 10);
  const currentDateStr = currentDate.toISOString();
  const responses = await Promise.all(
    [
      `sessions?limit=5&page=0&search=m&minStartDate=${daysAgoDate.toISOString()}&maxStartDate=${currentDateStr}`,
      `sessions?limit=5&page=0&search=m&minEndDate=${currentDateStr}&maxStartDate=${currentDateStr}`,
    ].map((url) => client.get(url).then((r) => r))
  );

  if (responses.some((r) => r.status !== 200)) {
    return null;
  }

  return { recent: fixAllDates(responses[0].data.items), current: fixAllDates(responses[1].data.items) };
};

export { listingLoader, getSessionData };
