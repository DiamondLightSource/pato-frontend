import { Box, Divider, Heading, HStack, Square, Tag, Text } from "@chakra-ui/react";
import FullCalendar, { EventClickArg, EventApi, EventInput } from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import { EventSourceInput } from "@fullcalendar/react";
import "../styles/main.css";
import { useCallback, useEffect, useState } from "react";
import { client } from "../utils/api/client";
import { useNavigate } from "react-router-dom";
import { components } from "../schema/main";

type SessionSchema = components["schemas"]["SessionResponse"];

interface EventProps {
  info: EventApi;
}

const EventItem = ({ info }: EventProps) => {
  return (
    <Box cursor='pointer' w='100%'>
      <HStack textOverflow='ellipsis' spacing={1} width='100%'>
        <Text fontWeight={600} color='diamond.600'>
          {info.start?.toLocaleTimeString("en-gb", { hour: "2-digit", minute: "2-digit" })}
        </Text>
        <Text>{info.title}</Text>
        <Text textOverflow='ellipsis' overflowX='hidden' opacity='0.7'>
          ({info.extendedProps.parentProposal}-{info.extendedProps.visitNumber})
        </Text>
      </HStack>
      <Divider />
    </Box>
  );
};

const Calendar = () => {
  const navigate = useNavigate();

  const eventClick = (e: EventClickArg) => {
    navigate(`/proposals/${e.event.extendedProps.proposalId}/sessions/${e.event.id}`);
  };

  const getEvents = useCallback((info: any , success: (e: EventInput[]) => void) => {
    console.log(info);
    client
      .safe_get(
        `sessions?minStartDate=${info.start.toISOString()}&maxStartDate=${info.end.toISOString()}&search=m&limit=250`
      )
      .then((response) => {
        const events: EventInput[] = response.data.items.map((event: SessionSchema) => ({
          id: event.sessionId,
          start: event.startDate,
          title: event.beamLineName,
          extendedProps: {
            proposalId: event.proposalId,
            parentProposal: event.parentProposal,
            visitNumber: event.visit_number,
          },
        }));
        success(events);
      });
  }, []);

  return (
    <div>
      <Heading>Calendar</Heading>
      <Divider />
      <Box paddingTop={3}>
        <FullCalendar
          height='80vh'
          plugins={[dayGridPlugin]}
          //events={(info, success) => getEvents(info, success)}
          eventTimeFormat={{
            hour: "2-digit",
            minute: "2-digit",
            meridiem: false,
          }}
          datesSet={(info) => {console.log(info)}}
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
