import type { RenderOptions } from "@testing-library/react";

import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import { createMemoryRouter, LoaderFunction, MemoryRouter, RouterProvider } from "react-router-dom";
import { Accordion } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InitialEntry } from "@remix-run/router";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0 } },
});

const renderWithProviders = (
  ui: React.ReactElement,
  renderOptions?: RenderOptions,
  initialEntries: InitialEntry[] = ["/"]
) => {
  const Wrapper = ({ children }: PropsWithChildren<{}>) => (
    <MemoryRouter initialEntries={initialEntries}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MemoryRouter>
  );

  return { ...render(ui, { wrapper: Wrapper, ...renderOptions }) };
};

const renderWithAccordion = (ui: React.ReactElement) =>
  renderWithProviders(<Accordion>{ui}</Accordion>);

const renderWithRoute = (
  ui: React.ReactElement,
  loader?: LoaderFunction,
  route: InitialEntry[] = ["/"]
) => {
  const router = createMemoryRouter(
    [
      {
        path: "*",
        element: ui,
        loader,
      },
    ],
    {
      initialEntries: route,
    }
  );

  return {
    router,
    ...render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    ),
  };
};

export { renderWithProviders, renderWithAccordion, renderWithRoute, queryClient };
