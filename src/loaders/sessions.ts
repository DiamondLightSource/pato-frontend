import { QueryClient } from "@tanstack/react-query";
import { SessionResponse } from "schema/interfaces";
import { client } from "utils/api/client";
import { parseSessionData } from "utils/api/response";
import { parseDate } from "utils/generic";

const fixAllDates = (sessions: SessionResponse[]) =>
  sessions.map((session) =>
    Object.assign({}, session, {
      startDate: parseDate(session.startDate),
      endDate: parseDate(session.endDate),
    })
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

  return {
    recent: fixAllDates(responses[0].data.items),
    current: fixAllDates(responses[1].data.items),
  };
};

const query = {
  queryKey: ["homepageSessions"],
  queryFn: getSessionData,
  staleTime: 60000,
};

export const sessionLoader = (queryClient: QueryClient) => async () =>
  (await queryClient.getQueryData(query.queryKey)) ?? (await queryClient.fetchQuery(query));

export const processSessionData = (data: Record<string, any>[]) =>
  data.map((item ) => parseSessionData(item as SessionResponse));
