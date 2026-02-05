import "@testing-library/jest-dom";

import { server } from "./src/mocks/server";
import { queryClient } from "./src/utils/test-utils";
import { cleanup } from "@testing-library/react";
import { useEffect } from "react";
import { ApngProps } from "@diamondlightsource/ui-components";

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

vi.mock("@diamondlightsource/ui-components", async (importOriginal) => {
  const actual = await importOriginal<any>();
  return {
    ...actual,
    APNGViewer: ({ onFrameCountChanged, src }: ApngProps) => {
      useEffect(() => {
        if (onFrameCountChanged) {
          onFrameCountChanged(3);
        }
      }, [onFrameCountChanged]);

      return src;
    },
  };
});

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

window.ENV = {
  API_URL: "http://localhost/",
  AUTH_URL: "http://localhost/auth/",
  DEV_CONTACT: "guilherme.de-freitas@diamond.ac.uk",
  ENVIRONMENT: "production",
  FEEDBACK_URL: "true",
  REPROCESSING_ENABLED: true
}


global.window.scrollTo = () => {}
global.ResizeObserver = ResizeObserver;
global.structuredClone = (val: Record<string, any>) => JSON.parse(JSON.stringify(val));