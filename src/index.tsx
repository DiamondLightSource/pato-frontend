import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, createStandaloneToast, extendTheme } from "@chakra-ui/react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Root } from "routes/Root";
import { GenericListing } from "routes/GenericListing";
import { TomogramPage } from "routes/Tomogram";
import { SpaPage } from "routes/SPA";
import { Error } from "routes/Error";
import { Accordion, Button, Text, Heading, Table, Card, Tabs, Checkbox, Code } from "styles/components";
import { colours } from "styles/colours";
import { Home } from "routes/Home";
import {
  beamlineToMicroscope,
  collectionHeaders,
  groupsHeaders,
  proposalHeaders,
  sessionHeaders,
} from "utils/config/table";
import { getUser } from "utils/loaders/user";
import { getSessionData, listingLoader } from "utils/loaders/listings";
import { parseDate } from "utils/generic";
import { getSpaData } from "utils/loaders/spa";
import { getTomogramData } from "utils/loaders/tomogram";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

const Calendar = React.lazy(() => import("routes/Calendar"));

const { ToastContainer } = createStandaloneToast();
const container = document.getElementById("root")!;
const root = createRoot(container);
const queryClient = new QueryClient();

if (process.env.REACT_APP_DEMO === "true") {
  const { worker } = require("./mocks/browser");
  worker.start();
}

const theme = extendTheme({
  colors: colours,
  components: { Accordion, Checkbox, Button, Text, Heading, Table, Card, Tabs, Code },
  breakpoints: {
    "sm": "30em",
    "md": "48em",
    "lg": "62em",
    "xl": "80em",
    "2xl": "150em",
  },
});

const checkListingChanged = (current: URL, next: URL) =>
  (current.searchParams.get("items") !== null || current.searchParams.get("page") !== null) &&
  current.href !== next.href;

const handleGroupClicked = (item: Record<string, string | number>) => {
  // Temporary workaround
  if (item.experimentType === "tomo") {
    return `${item.dataCollectionGroupId}/tomograms`;
  }

  switch (item.experimentTypeName) {
    case "Single Particle":
      return `${item.dataCollectionGroupId}/spa`;
    case "Tomogram":
      return `${item.dataCollectionGroupId}/tomograms/1`;
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
    shouldRevalidate: () => false,
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
        loader: ({ request, params }) => listingLoader(queryClient)(request, params, "proposals"),
        shouldRevalidate: ({ currentUrl, nextUrl }) => checkListingChanged(currentUrl, nextUrl),
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
        loader: ({ request, params }) => listingLoader(queryClient)(request, params, "sessions", processSessionData),
        shouldRevalidate: ({ currentUrl, nextUrl }) => checkListingChanged(currentUrl, nextUrl),
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
        loader: ({ request, params }) => listingLoader(queryClient)(request, params, "dataGroups"),
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
        loader: ({ request, params }) => listingLoader(queryClient)(request, params, "dataCollections"),
        shouldRevalidate: ({ currentUrl, nextUrl }) => checkListingChanged(currentUrl, nextUrl),
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
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
        <ToastContainer />
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>
);
