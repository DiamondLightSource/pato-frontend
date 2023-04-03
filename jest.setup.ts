import "@testing-library/jest-dom";

import { server } from "./src/mocks/server";
import "whatwg-fetch";

process.env.REACT_APP_API_ENDPOINT = "http://localhost/";

beforeEach(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;
global.window.scrollTo = () => {};
global.structuredClone = (val: Record<string, any>) => JSON.parse(JSON.stringify(val));
global.URL.createObjectURL = (url: Blob | MediaSource) => "blob://test";

jest.mock("molstar/lib/mol-canvas3d/canvas3d");
jest.mock("molstar/lib/mol-plugin/context");
jest.mock("molstar/lib/mol-plugin/spec");
