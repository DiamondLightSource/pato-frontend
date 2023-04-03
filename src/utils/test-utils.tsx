import type { RenderOptions } from "@testing-library/react";

import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import {
  createMemoryRouter,
  LoaderFunction,
  MemoryRouter,
  RouterProvider,
} from "react-router-dom";
import { Accordion } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

interface ExtendedRenderOptions extends Omit<RenderOptions, "queries"> {
  route?: string;
}

const renderWithProviders = (
  ui: React.ReactElement,
  { route = "/", ...renderOptions }: ExtendedRenderOptions = {}
): any => {
  const Wrapper = ({ children }: PropsWithChildren<{}>) => {
    window.history.pushState({}, "Test page", route);

    return (
      <MemoryRouter initialEntries={[route]}>
        <QueryClientProvider client={new QueryClient()}>
          {children}
        </QueryClientProvider>
      </MemoryRouter>
    );
  };

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
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
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
};

export { renderWithProviders, renderWithAccordion, renderWithRoute };
