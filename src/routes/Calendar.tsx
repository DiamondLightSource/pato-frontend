import { Box, Divider, Heading, HStack, Text } from "@chakra-ui/react";
import FullCalendar, {
  EventClickArg,
  EventApi,
  EventInput,
  DatesSetArg,
} from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useCallback, useEffect, useState } from "react";
import { client } from "utils/api/client";
import { useNavigate } from "react-router-dom";
import { components } from "schema/main";
import "styles/calendar.css";

type SessionSchema = components["schemas"]["SessionResponse"];

interface EventProps {
  info: EventApi;
}

const EventItem = ({ info }: EventProps) => {
  return (
    <Box data-testid={`event-${info.title}`} cursor="pointer" w="100%">
      <HStack
        alignItems="stretch"
        textOverflow="ellipsis"
        spacing={1}
        width="100%"
      >
        <Box w="2px" bg="diamond.600" />
        <Text fontWeight={600} color="diamond.600">
          {info.start!.toLocaleTimeString("en-gb", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
        <Text>{info.title}</Text>
        <Text textOverflow="ellipsis" overflowX="hidden" opacity="0.7">
          ({info.extendedProps.parentProposal}-{info.extendedProps.visitNumber})
        </Text>
      </HStack>
      <Divider />
    </Box>
  );
};

const Calendar = () => {
  const navigate = useNavigate();

  const eventClick = useCallback(
    (e: EventClickArg) => {
      navigate(
        `/proposals/${e.event.extendedProps.proposalId}/sessions/${e.event.id}`
      );
    },
    [navigate]
  );

  const [events, setEvents] = useState<EventInput[]>();
  const [calendarDates, setCalendarDates] = useState<{
    start: string;
    end: string;
  }>();

  const updateDates = useCallback((dateInfo: DatesSetArg) => {
    setCalendarDates({
      start: dateInfo.start.toISOString(),
      end: dateInfo.end.toISOString(),
    });
  }, []);

  useEffect(() => {
    if (!calendarDates) {
      return;
    }

    client
      .safe_get(
        `sessions?minStartDate=${calendarDates.start}&maxStartDate=${calendarDates.end}&search=m&limit=250`
      )
      .then((response) => {
        const events: EventInput[] = response.data.items
          .filter((event: SessionSchema) => event.startDate !== null)
          .map((event: SessionSchema) => ({
            id: event.sessionId,
            start: event.startDate,
            title: event.beamLineName,
            extendedProps: {
              proposalId: event.proposalId,
              parentProposal: event.parentProposal,
              visitNumber: event.visit_number,
            },
          }));
        setEvents(events);
      });
  }, [calendarDates]);

  return (
    <div>
      <Heading>Calendar</Heading>
      <Divider />
      <Box paddingTop={3}>
        <FullCalendar
          height="80vh"
          plugins={[dayGridPlugin]}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
          }}
          buttonText={{
            today: "Current Month",
          }}
          datesSet={updateDates}
          events={events}
          eventContent={(info) => <EventItem info={info.event} />}
          dayMaxEventRows={true}
          dayMaxEvents={true}
          eventClick={(e) => eventClick(e)}
        />
      </Box>
    </div>
  );
};

export default Calendar;
