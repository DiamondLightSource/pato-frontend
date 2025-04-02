import type { RenderOptions } from "@testing-library/react";

import React, { PropsWithChildren } from "react";
import { render } from "@testing-library/react";
import { createMemoryRouter, LoaderFunction, MemoryRouter, RouterProvider } from "react-router";
import { Accordion } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { InitialEntry } from "react-router";

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

const renderWithAccordion = (
  ui: React.ReactElement,
  renderOptions?: RenderOptions,
  initialEntries: InitialEntry[] = ["/"]
) => renderWithProviders(<Accordion>{ui}</Accordion>, renderOptions, initialEntries);

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
        hydrateFallbackElement: <></>,
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
