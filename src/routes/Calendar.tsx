import { Box, Divider, Heading } from "@chakra-ui/react";
import FullCalendar, { EventClickArg, EventSourceInput } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timegridPlugin from "@fullcalendar/timegrid";
import "../styles/main.css";
import { useEffect, useState } from "react";
import { client } from "../utils/api/client";
import { useNavigate } from "react-router-dom";

const Calendar = (): JSX.Element => {
  const [events, setEvents] = useState<EventSourceInput>({});
  const navigate = useNavigate();

  const eventClick = (e: EventClickArg) => {
    navigate(`/proposals/${e.event.extendedProps.proposalId}/sessions/${e.event.id}`);
  };

  useEffect(() => {
    document.title = "eBIC » Calendar";
    client.safe_get("sessions?minDate=2022-10-01&maxDate=2022-10-31").then((response) => {
      const events = response.data.map((event: Record<string, any>) => ({
        id: event.sessionId,
        start: event.startDate,
        end: event.endDate,
        title: event.beamLineName,
        extendedProps: {
          proposalId: event.proposalId,
        },
      }));

      setEvents(events);
    });
  }, []);

  return (
    <div>
      <Heading>Calendar</Heading>
      <Divider />
      <Box paddingTop={3}>
        <FullCalendar
          height='70vh'
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          plugins={[dayGridPlugin, timegridPlugin]}
          events={events}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
          }}
          dayMaxEventRows={true}
          dayMaxEvents={true}
          eventClick={(e) => eventClick(e)}
        />
      </Box>
    </div>
  );
};

export default Calendar;
