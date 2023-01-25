import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ChakraProvider, createStandaloneToast, extendTheme } from "@chakra-ui/react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Root } from "./routes/Root";
import { GenericListing } from "./routes/GenericListing";
import { TomogramPage } from "./routes/Tomogram";
import { SpaPage } from "./routes/SPA";
import { Error } from "./routes/Error";
import { Accordion, Button, Text, Heading, Table, Card, Tabs } from "./styles/components";
import { Calendar } from "./routes/Calendar";
import { colours } from "./styles/colours";
import { Home } from "./routes/Home";
const { ToastContainer } = createStandaloneToast();

const container = document.getElementById("root")!;
const root = createRoot(container);

if (process.env.DEPLOY_TYPE === "demo") {
  const { worker } = require("./mocks/browser");
  worker.start();
}

if (process.env.REACT_APP_AUTH_TYPE === "dummy") {
  sessionStorage.setItem("token", "dummyToken");
}

const theme = extendTheme({
  colors: colours,
  components: { Accordion, Button, Text, Heading, Table, Card, Tabs },
});

const proposalHeaders = [
  { key: "proposalCode", label: "Code" },
  { key: "proposalNumber", label: "Number" },
  { key: "sessions", label: "sessions" },
  { key: "title", label: "Title" },
];

const visitHeaders = [
  { key: "visit_number", label: "Visit" },
  { key: "startDate", label: "Start Date" },
  { key: "endDate", label: "End Date" },
  { key: "microscopeName", label: "Microscope" },
  { key: "collectionGroups", label: "Collection Groups" },
];

const groupsHeaders = [
  { key: "dataCollectionGroupId", label: "ID" },
  { key: "comments", label: "Comments" },
  { key: "collections", label: "Collections" },
  { key: "experimentTypeName", label: "Experiment Type" },
];

const handleGroupClicked = (item: Record<string, string | number>) => {
  // Temporary workaround
  if (item.experimentType === "tomo") {
    return `${item.dataCollectionGroupId}/tomograms`;
  }

  switch (item.experimentTypeName) {
    case "Single Particle":
      return `${item.dataCollectionGroupId}/spa`;
    default:
      return `${item.dataCollectionGroupId}/spa`;
  }
};

const beamlineToMicroscope: Record<string, string> = {
  m02: "Krios 1",
  m03: "Krios 2",
  m04: "Talos",
  m06: "Krios 3",
  m07: "Krios 4",
  m08: "Krios 5",
  m10: "Glacios 1",
  m12: "Glacios 2",
};

const processSessionData = (data: Record<string, string | number>[]) => {
  return data.map((item: Record<string, string | number>) => {
    let newItem = Object.assign({}, item);
    const beamLineName = item.beamLineName as string;
    newItem["microscopeName"] = beamlineToMicroscope[beamLineName] ?? beamLineName;
    return newItem;
  });
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />,
      },
      {
        path: "/proposals",
        element: (
          <GenericListing
            headers={proposalHeaders}
            endpoint='proposals'
            heading='Proposals'
            makePathCallback={(item) => [item.proposalCode, item.proposalNumber].join("")}
          />
        ),
      },
      {
        path: "/calendar",
        element: <Calendar />,
      },
      {
        path: "/proposals/:propid",
        element: <Navigate to='sessions' replace />,
      },
      {
        path: "/proposals/:propId/sessions",
        element: (
          <GenericListing
            headers={visitHeaders}
            endpoint='sessions'
            heading='Sessions'
            makePathCallback={(item) => item.visit_number.toString()}
            processData={processSessionData}
          />
        ),
      },
      {
        path: "/proposals/:propid/sessions/:visitId",
        element: <Navigate to='groups' replace />,
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups",
        element: (
          <GenericListing
            headers={groupsHeaders}
            endpoint='dataGroups'
            heading='Data Collection Groups'
            makePathCallback={(item) => handleGroupClicked(item)}
          />
        ),
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/tomograms/",
        element: <Navigate to='1' replace />,
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/tomograms/:collectionIndex",
        element: <TomogramPage />,
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/spa/",
        element: <SpaPage />,
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/",
        element: <Navigate to='..' relative='path' replace />,
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
