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

jest.mock("./src/store/store");

jest.mock("molstar/lib/mol-plugin/spec", () => ({
  DefaultPluginSpec: () => {},
}));

jest.mock("molstar/lib/mol-plugin/context", () => {
  class PluginMock {
    builders = { data: { rawData: () => {} } };
    dataFormats = { get: () => ({ parse: () => ({ volumes: [{ data: "AA" }] }) }) };
    animationLoop = { stop: () => {} };
    dispose = () => {};
    init = jest.fn();
    initViewer = () => {};
    build = () => ({ to: () => ({ apply: () => ({ commit: jest.fn() }) }) });
  }

  return {
    PluginContext: PluginMock,
  };
});

jest.mock("molstar/lib/mol-plugin/config", () => ({
  PluginConfig: {
    VolumeStreaming: () => ({
      Enabled: () => {},
    }),
  },
}));

jest.mock("molstar/lib/mol-plugin-state/transforms", () => {
  return {
    StateTransforms: { Representation: { VolumeRepresentation3D: "" } },
  };
});

jest.mock("molstar/lib/mol-plugin-state/helpers/volume-representation-params", () => {
  return {
    createVolumeRepresentationParams: () => {},
  };
});
