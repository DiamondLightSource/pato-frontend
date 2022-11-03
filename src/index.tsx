import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ChakraProvider, createStandaloneToast, extendTheme } from "@chakra-ui/react";
import Login from "./routes/Login";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Root from "./routes/Root";
import GenericListing from "./routes/GenericListing";
import Collection from "./routes/Collection";
import { Accordion, Button, Text, Heading } from "./styles/components";
import Calendar from "./routes/Calendar";
import { colours } from "./styles/colours";
const { ToastContainer } = createStandaloneToast();

const container = document.getElementById("root")!;
const root = createRoot(container);

if (process.env.NODE_ENV === "developments") {
  const { worker } = require("./mocks/browser");
  worker.start();
}

const theme = extendTheme({
  colors: colours,
  components: { Accordion, Button, Text, Heading },
});

const proposalHeaders = [
  { key: "proposalCode", label: "Code" },
  { key: "proposalNumber", label: "Number" },
  { key: "visits", label: "Visits" },
  { key: "title", label: "Title" },
];

const visitHeaders = [
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "beamLineName", label: "Beamline" },
  { key: "visit_number", label: "Visit" },
];

const collectionHeaders = [
  { key: "dataCollectionId", label: "ID" },
  { key: "startTime", label: "Start Time" },
  { key: "comments", label: "Comments" },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
      {
        path: "/proposals",
        element: (
          <GenericListing headers={proposalHeaders} endpoint='proposals' heading='Proposals' routeKey='proposalId' />
        ),
      },
      {
        path: "/calendar",
        element: <Calendar />,
      },
      {
        path: "/proposals/:propid",
        element: <Navigate to='visits' replace />,
      },
      {
        path: "/proposals/:propId/visits",
        element: <GenericListing headers={visitHeaders} endpoint='visits' heading='Visits' routeKey='sessionId' />,
      },
      {
        path: "/proposals/:propid/visits/:visitId",
        element: <Navigate to='collections' replace />,
      },
      {
        path: "/proposals/:propId/visits/:visitId/collections",
        element: (
          <GenericListing
            headers={collectionHeaders}
            endpoint='collections'
            heading='Data Collections'
            routeKey='dataCollectionId'
          />
        ),
      },
      {
        path: "/proposals/:propId/visits/:visitId/collections/:collectionId",
        element: <Collection />,
      },
    ],
  },
]);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <Provider store={store}>
        <RouterProvider router={router} />
        <ToastContainer />
      </Provider>
    </ChakraProvider>
  </React.StrictMode>
);
