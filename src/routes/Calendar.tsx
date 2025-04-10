import { Box, Divider, Heading, HStack, Text } from "@chakra-ui/react";
import { EventClickArg, EventInput, DatesSetArg, EventContentArg } from "@fullcalendar/core";
import dayGridPlugin from "@fullcalendar/daygrid";
import { useCallback, useEffect, useState } from "react";
import { client } from "utils/api/client";
import { useNavigate } from "react-router";
import { components } from "schema/main";
import "styles/calendar.css";
import FullCalendar from "@fullcalendar/react";

type SessionSchema = components["schemas"]["SessionResponse"];

const EventItem = ({ event }: EventContentArg) => (
  <Box data-testid={`event-${event.title}`} cursor='pointer' w='100%'>
    <HStack alignItems='stretch' textOverflow='ellipsis' spacing={1} width='100%'>
      <Box w='2px' bg='diamond.600' />
      <Text fontWeight={600} color='diamond.600'>
        {event.start!.toLocaleTimeString("en-gb", {
          hour: "2-digit",
          minute: "2-digit",
        })}
      </Text>
      <Text>{event.title}</Text>
      <Text textOverflow='ellipsis' overflowX='hidden' opacity='0.7'>
        ({event.extendedProps.parentProposal}-{event.extendedProps.visitNumber})
      </Text>
    </HStack>
    <Divider />
  </Box>
);
const Calendar = () => {
  const navigate = useNavigate();

  const eventClick = useCallback(
    (e: EventClickArg) => {
      navigate(
        `/proposals/${e.event.extendedProps.parentProposal}/sessions/${e.event.extendedProps.visitNumber}`
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
      .safeGet(
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
          height='80vh'
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
          eventContent={EventItem}
          dayMaxEventRows={true}
          dayMaxEvents={true}
          eventClick={eventClick}
        />
      </Box>
    </div>
  );
};

export default Calendar;
