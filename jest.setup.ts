import "@testing-library/jest-dom";

import { server } from "./src/mocks/server";
import { queryClient } from "./src/utils/test-utils";
import "whatwg-fetch";

process.env.REACT_APP_API_ENDPOINT = "http://localhost/";

beforeEach(() => server.listen());
afterEach(() => {
  server.resetHandlers();
  queryClient.clear();
});
afterAll(() => server.close());

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;
window.scrollTo = () => {};
global.structuredClone = (val: Record<string, any>) => JSON.parse(JSON.stringify(val));
global.URL.createObjectURL = (url: Blob | MediaSource) => "blob://test";
