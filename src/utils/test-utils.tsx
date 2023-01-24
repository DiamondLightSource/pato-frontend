import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";
import { configureStore } from "@reduxjs/toolkit";
import type { PreloadedState } from "@reduxjs/toolkit";
import { Provider } from "react-redux";

import type { AppStore, RootState } from "../store/store";
import authReducer from "../features/authSlice";
import uiReducer from "../features/uiSlice";
import { BrowserRouter } from "react-router-dom";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<RootState>;
  route?: string;
  store?: AppStore;
}

const renderWithProviders = (
  ui: React.ReactElement,
  {
    preloadedState = { auth: { user: null }, ui: { loading: false } },
    route = "/",
    store = configureStore({ reducer: { auth: authReducer, ui: uiReducer }, preloadedState }),
    ...renderOptions
  }: ExtendedRenderOptions = {}
): any => {
  function Wrapper({ children }: PropsWithChildren<{}>): JSX.Element {
    window.history.pushState({}, "Test page", route);

    return (
      <BrowserRouter>
        <Provider store={store}>{children}</Provider>
      </BrowserRouter>
    );
  }

  return { store, ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

export { renderWithProviders };
