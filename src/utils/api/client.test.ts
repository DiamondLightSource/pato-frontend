import { client, prependApiUrl } from "utils/api/client";
import { waitFor } from "@testing-library/react";

const oldEnv = structuredClone(process.env);

describe("Client Helper Functions", () => {
  afterAll(() => {
    process.env = oldEnv;
  });

  it("should prefix current location to URLs if API endpoint starts with /", () => {
    process.env.REACT_APP_API_ENDPOINT = "/api/";
    expect(prependApiUrl("test")).toBe("http://localhost:3000/api/test");
  });

  it("should prefix full URL to requests when applicable", () => {
    process.env.REACT_APP_API_ENDPOINT = "https://otherlocation.co.uk/";
    expect(prependApiUrl("test")).toBe("https://otherlocation.co.uk/test");
  });
});

describe("Client Main Class", () => {
  it("should redirect if safe endpoint returns a 401", async () => {
    const originalLocation = window.location;

    Object.defineProperty(window, "location", {
      value: { ...originalLocation, assign: vi.fn() },
      configurable: true,
    });

    await client.safeGet("unauthorisedEndpoint");

    await waitFor(() =>
      expect(window.location.assign).toBeCalledWith(
        "http://localhost/auth/authorise?redirect_uri=http%3A%2F%2Flocalhost%3A3000%2F&responseType=code"
      )
    );
  });
});
