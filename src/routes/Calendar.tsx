import { Box, Divider, Heading } from "@chakra-ui/react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timegridPlugin from "@fullcalendar/timegrid";
import "../styles/main.css";

const Calendar = (): JSX.Element => {
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
        />
      </Box>
    </div>
  );
};

export default Calendar;
