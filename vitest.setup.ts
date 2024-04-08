import "@testing-library/jest-dom";

import { server } from "./src/mocks/server";
import { queryClient } from "./src/utils/test-utils";
import { cleanup } from "@testing-library/react";

export const mockToast = vi.fn();

beforeEach(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
  mockToast.mockClear();
  cleanup();
});
afterAll(() => {
  server.close();
  vi.restoreAllMocks();
});

vi.mock("@chakra-ui/react", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    createStandaloneToast: () => ({ toast: mockToast }),
    useToast: () => mockToast,
  };
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.window.scrollTo = () => {}
global.ResizeObserver = ResizeObserver;
global.structuredClone = (val: Record<string, any>) => JSON.parse(JSON.stringify(val));