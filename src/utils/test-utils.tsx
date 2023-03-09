import type { AppStore, RootState } from "store/store";
import type { RenderOptions } from "@testing-library/react";
import type { PreloadedState } from "@reduxjs/toolkit";

import { configureStore } from "@reduxjs/toolkit";
import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import { Provider } from "react-redux";
import uiReducer from "features/uiSlice";
import {
  createMemoryRouter,
  LoaderFunction,
  MemoryRouter,
  RouterProvider,
} from "react-router-dom";
import { Accordion } from "@chakra-ui/react";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<RootState>;
  route?: string;
  store?: AppStore;
}

const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = { ui: { loading: false } },
    route = "/",
    store = configureStore({ reducer: { ui: uiReducer }, preloadedState }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
): any => {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    window.history.pushState({}, "Test page", route);

    return (
      <MemoryRouter initialEntries={[route]}>
        <Provider store={store}>{children}</Provider>
      </MemoryRouter>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

const renderWithAccordion = (ui: React.ReactElement) => {
  return renderWithProviders(<Accordion>{ui}</Accordion>);
};

const renderWithRoute = (
  ui: React.ReactElement,
  loader: LoaderFunction,
  route = "/"
) => {
  const router = createMemoryRouter([
    {
      path: "*",
      element: ui,
      loader: loader,
    },
  ]);
  return render(<RouterProvider router={router} />);
};

export { renderWithProviders, renderWithAccordion, renderWithRoute };
