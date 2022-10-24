import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import Login from "./routes/Login";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Root from "./routes/Root";
import Proposals from "./routes/Proposals";
import Collection from "./routes/Collection";
import { defaults } from "./styles/components";

const container = document.getElementById("root")!;
const root = createRoot(container);

if (process.env.NODE_ENV === "development") {
  const { worker } = require("./mocks/browser");
  worker.start();
}

const theme = extendTheme({
  colors: {
    diamond: {
      100: "#E7ECEF",
      400: "#A3CEF1",
      500: "#6096BA",
      600: "#034078",
      700: "#274C77",
      800: "#0a1128",
    },
  },
  components: defaults,
});

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
        element: <Proposals />,
      },
      {
        path: "/proposals/:propId",
        element: <Root />, //TODO: create actual proposal page
      },
      {
        path: "/proposals/:propId/visits/:visitId",
        element: <Root />, //TODO: create actual proposal page
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
      </Provider>
    </ChakraProvider>
  </React.StrictMode>
);
