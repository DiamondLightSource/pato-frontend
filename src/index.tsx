import React, { Suspense } from "react";
import { createRoot } from "react-dom/client";
import { ChakraProvider, createStandaloneToast } from "@chakra-ui/react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { Root } from "routes/Root";
import { GenericListing } from "routes/GenericListing";
import { TomogramPage } from "routes/Tomogram";
import { SpaPage } from "routes/SPA";
import { Error } from "routes/Error";
import { Home } from "routes/Home";
import {
  collectionHeaders,
  groupsHeaders,
  proposalHeaders,
  sessionHeaders,
} from "utils/config/table";
import { getUser } from "loaders/user";
import {
  checkListingChanged,
  handleCollectionClicked,
  handleGroupClicked,
  listingLoader,
} from "loaders/listings";
import { spaLoader } from "loaders/spa";
import { tomogramLoader } from "loaders/tomogram";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { processSessionData, sessionLoader } from "loaders/sessions";
import { theme } from "styles/main";
import FeedbackForm from "routes/Report";

const Calendar = React.lazy(() => import("routes/Calendar"));

const { ToastContainer } = createStandaloneToast();
const container = document.getElementById("root")!;
const root = createRoot(container);
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1.08e7 } } });

if (process.env.REACT_APP_DEPLOY_TYPE === "demo") {
  const { worker } = require("./mocks/browser");
  worker.start();
}

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
        loader: sessionLoader(queryClient),
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
        path: "/feedback",
        element: <FeedbackForm />,
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
        loader: ({ request, params }) =>
          listingLoader(queryClient)(request, params, "sessions", processSessionData),
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
        loader: ({ request, params }) =>
          listingLoader(queryClient)(request, params, "dataCollections"),
        shouldRevalidate: ({ currentUrl, nextUrl }) => checkListingChanged(currentUrl, nextUrl),
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/tomograms/",
        element: <Navigate to='1' replace />,
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/tomograms/:collectionIndex",
        element: <TomogramPage />,
        loader: ({ params, request }) => tomogramLoader(queryClient)(params, request),
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/spa/",
        element: <SpaPage />,
        loader: ({ params }) => spaLoader(queryClient)(params),
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
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>
);
