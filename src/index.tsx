import React, { Suspense } from "react";
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
import { colours } from "./styles/colours";
import { Home } from "./routes/Home";
import {
  beamlineToMicroscope,
  collectionHeaders,
  groupsHeaders,
  proposalHeaders,
  sessionHeaders,
} from "./utils/config/table";
import { getUser } from "./utils/loaders/user";
import { getListingData, getSessionData } from "./utils/loaders/listings";
import { parseDate } from "./utils/generic";
import { getSpaData } from "./utils/loaders/spa";
import { getTomogramData } from "./utils/loaders/tomogram";
const Calendar = React.lazy(() => import("./routes/Calendar"));

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

const handleCollectionClicked = (item: Record<string, string | number>) => `../tomograms/${item.index}`;

const processSessionData = (data: Record<string, string | number>[]) =>
  data.map((item: Record<string, string | number>) => {
    let newItem = Object.assign({}, item, {
      startDate: parseDate(item.startDate as string),
      endDate: parseDate(item.endDate as string),
    });
    const beamLineName = item.beamLineName as string;
    const humanName = beamlineToMicroscope[beamLineName];
    newItem["microscopeName"] = humanName ? `${humanName} (${beamLineName})` : beamLineName;
    return newItem;
  });

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    loader: getUser,
    children: [
      {
        path: "/",
        element: <Home />,
        loader: getSessionData,
      },
      {
        path: "/proposals",
        element: (
          <GenericListing
            headers={proposalHeaders}
            heading='Proposals'
            makePathCallback={(item) => [item.proposalCode, item.proposalNumber].join("")}
          />
        ),
        loader: ({ request, params }) => getListingData(request, params, "proposals"),
      },
      {
        path: "/calendar",
        element: (
          <Suspense>
            <Calendar />
          </Suspense>
        ),
      },
      {
        path: "/proposals/:propid",
        element: <Navigate to='sessions' replace />,
      },
      {
        path: "/proposals/:propId/sessions",
        element: (
          <GenericListing
            headers={sessionHeaders}
            heading='Sessions'
            makePathCallback={(item) => item.visit_number.toString()}
          />
        ),
        loader: ({ request, params }) => getListingData(request, params, "sessions", processSessionData),
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
            heading='Data Collection Groups'
            makePathCallback={handleGroupClicked}
          />
        ),
        loader: ({ request, params }) => getListingData(request, params, "dataGroups"),
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/collections",
        element: (
          <GenericListing
            headers={collectionHeaders}
            heading='Data Collections'
            makePathCallback={handleCollectionClicked}
          />
        ),
        loader: ({ request, params }) => getListingData(request, params, "dataCollections"),
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/tomograms/",
        element: <Navigate to='1' replace />,
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/tomograms/:collectionIndex",
        element: <TomogramPage />,
        loader: ({ params, request }) => getTomogramData(params, request),
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/spa/",
        element: <SpaPage />,
        loader: ({ params }) => getSpaData(params),
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
