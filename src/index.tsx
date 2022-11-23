import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ChakraProvider, createStandaloneToast, extendTheme } from "@chakra-ui/react";
import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Root from "./routes/Root";
import GenericListing from "./routes/GenericListing";
import Collection from "./routes/Collection";
import Error from "./routes/Error";
import { Accordion, Button, Text, Heading, Table } from "./styles/components";
import Calendar from "./routes/Calendar";
import { colours } from "./styles/colours";
import { checkUser } from "./features/authSlice";
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
  components: { Accordion, Button, Text, Heading, Table },
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

const groupsHeaders = [
  { key: "dataCollectionGroupId", label: "ID" },
  { key: "comments", label: "Comments" },
  { key: "collections", label: "Collections" },
];

const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    errorElement: <Error />,
    children: [
      {
        path: "/proposals",
        element: (
          <GenericListing
            headers={proposalHeaders}
            endpoint='proposals'
            heading='Proposals'
            routeKeys={["proposalCode", "proposalNumber"]}
          />
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
        element: <GenericListing headers={visitHeaders} endpoint='visits' heading='Visits' routeKeys={["sessionId"]} />,
      },
      {
        path: "/proposals/:propid/visits/:visitId",
        element: <Navigate to='groups' replace />,
      },
      {
        path: "/proposals/:propId/visits/:visitId/groups",
        element: (
          <GenericListing
            headers={groupsHeaders}
            endpoint='dataCollectionGroups'
            heading='Data Collection Groups'
            routeKeys={["dataCollectionGroupId"]}
          />
        ),
      },
      {
        path: "/proposals/:propId/visits/:visitId/groups/:groupId/",
        element: <Navigate to='collections' replace />,
      },
      {
        path: "/proposals/:propId/visits/:visitId/groups/:groupId/collections/",
        element: <Navigate to='1' replace />,
      },
      {
        path: "/proposals/:propId/visits/:visitId/groups/:groupId/collections/:collectionIndex",
        element: <Collection />,
      },
    ],
  },
]);

const initializeUser = async () => {
  if (sessionStorage.getItem("token") !== null) {
    await store.dispatch(checkUser());
  }
};

initializeUser().then(() =>
  root.render(
    <React.StrictMode>
      <ChakraProvider theme={theme}>
        <Provider store={store}>
          <RouterProvider router={router} />
          <ToastContainer />
        </Provider>
      </ChakraProvider>
    </React.StrictMode>
  )
);
