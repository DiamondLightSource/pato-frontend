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
import { collectionHeaders, proposalHeaders, sessionHeaders } from "utils/config/table";
import { getUser } from "loaders/user";
import { handleCollectionClicked, listingLoader } from "loaders/listings";
import { spaLoader } from "loaders/spa";
import { tomogramLoader } from "loaders/tomogram";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { processSessionData, sessionLoader } from "loaders/sessions";
import { theme } from "@diamondlightsource/ui-components";
import FeedbackForm from "routes/Feedback";
import { SessionPage } from "routes/Session";
import { sessionPageLoader } from "loaders/session";
import { SessionResponse } from "schema/interfaces";
import { UploadModelPage } from "routes/UploadModel";
import AtlasPage from "routes/Atlas";
import { atlasLoader } from "loaders/atlas";
import AlertPage from "routes/Alert";
import { groupLoader } from "loaders/group";

const Calendar = React.lazy(() => import("routes/Calendar"));
const About = React.lazy(() => import("routes/About"));

const { ToastContainer } = createStandaloneToast();
const container = document.getElementById("root")!;
const root = createRoot(container);
const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 1.08e7 } } });

if (window.ENV.ENVIRONMENT === "demo" && process.env.NODE_ENV === "development") {
  const { worker } = require("./mocks/browser");
  worker.start();
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    loader: () => getUser(false),
    shouldRevalidate: () => false,
    children: [
      {
        path: "/",
        element: <Home />,
        loader: sessionLoader(queryClient),
      },
      {
        path: "/about",
        element: (
          <Suspense>
            <About />
          </Suspense>
        ),
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
          listingLoader<SessionResponse>(queryClient)(
            request,
            params,
            "sessions",
            processSessionData
          ),
      },
      {
        path: "/proposals/:propId/sessions/:visitId",
        element: <SessionPage />,
        loader: ({ request, params }) => sessionPageLoader(queryClient)(request, params),
      },
      {
        path: "/proposals/:propId/sessions/:visitId/upload-model",
        element: <UploadModelPage />,
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups",
        element: <Navigate to='..' replace relative='path' />,
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/collections",
        element: (
          <GenericListing
            headers={collectionHeaders}
            heading='Data Collections'
            makePathCallback={handleCollectionClicked}
            sortOptions={[
              { key: "dataCollectionId", value: "Data Collection ID" },
              { key: "globalAlignmentQuality", value: "Alignment Quality" },
            ]}
          />
        ),
        loader: ({ request, params }) =>
          listingLoader(queryClient)(request, params, "dataCollections"),
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/alerts",
        element: <AlertPage />,
        loader: () => getUser(true),
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
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/atlas",
        element: <AtlasPage />,
        loader: ({ request, params }) => atlasLoader(queryClient)(request, params),
      },
      {
        path: "/proposals/:propId/sessions/:visitId/groups/:groupId/",
        loader: ({ params }) => groupLoader(params),
        element: <></>,
      },
    ],
  },
]);

root.render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} future={{v7_startTransition: true}}/>
        <ToastContainer />
        {process.env.NODE_ENV === "development" && <ReactQueryDevtools initialIsOpen={false} />}
      </QueryClientProvider>
    </ChakraProvider>
  </React.StrictMode>
);
