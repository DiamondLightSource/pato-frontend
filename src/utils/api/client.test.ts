import { client, prependApiUrl } from "utils/api/client";
import { waitFor } from "@testing-library/react";

const oldEnv = structuredClone(window.ENV);

describe("Client Helper Functions", () => {
  afterAll(() => {
    window.ENV = oldEnv;
  });

  it("should prefix current location to URLs if API endpoint starts with /", () => {
    window.ENV.API_URL = "/api/";
    expect(prependApiUrl("test")).toBe("http://localhost:3000/api/test");
  });

  it("should prefix full URL to requests when applicable", () => {
    window.ENV.API_URL = "https://otherlocation.co.uk/";
    expect(prependApiUrl("test")).toBe("https://otherlocation.co.uk/test");
  });
});

describe("Client Main Class", () => {
  it("should redirect if safe endpoint returns a 401", async () => {
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      value: { ...originalLocation, replace: vi.fn() },
      configurable: true,
    });

    await client.safeGet("unauthorisedEndpoint");

    await waitFor(() =>
      expect(window.location.replace).toBeCalledWith(
        "http://localhost/auth/authorise?redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&responseType=code"
      )
    );
  });
});
