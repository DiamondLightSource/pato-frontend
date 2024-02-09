import { server } from "mocks/server";
import { rest } from "msw";
import { queryClient } from "utils/test-utils";
import { handleGroupClicked, sessionPageLoader } from "loaders/session";

const request = new Request("http://localhost/proposals/");

describe("Session Data", () => {
  it("should return data for session if available", async () => {
    const data = await sessionPageLoader(queryClient)(request, { propId: "1", visitId: "1" });

    expect(data.items).toHaveLength(1);
    expect(data.session).toMatchObject({ beamLineName: "m01" });
  });

  it("should return null if a request fails", async () => {
    server.use(
      rest.get("http://localhost/proposals/:propId/sessions/:visitId", (req, res, ctx) =>
        res(ctx.status(404), ctx.delay(0))
      )
    );
    const data = await sessionPageLoader(queryClient)(request, { propId: "1", visitId: "1" });

    expect(data.items).toBe(null);
    expect(data.session).toBe(null);
  });
});

describe("Group Selection Handler", () => {
  it("should get proper redirect URL for tomograms", () => {
    expect(handleGroupClicked({ experimentTypeName: "Tomogram", dataCollectionGroupId: 1 })).toBe(
      "groups/1/tomograms/1"
    );
  });

  it("should get proper redirect URL for SPA", () => {
    expect(
      handleGroupClicked({ experimentTypeName: "Single Particle", dataCollectionGroupId: 1 })
    ).toBe("groups/1/spa");
  });

  it("should default to SPA redirect URL", () => {
    expect(handleGroupClicked({ experimentTypeName: "invalid", dataCollectionGroupId: 1 })).toBe(
      "groups/1/spa"
    );
  });

  it("should redirect user to tomogram page if experimentType is tomo", () => {
    expect(handleGroupClicked({ experimentType: "tomo", dataCollectionGroupId: 1 })).toBe(
      "groups/1/tomograms/1"
    );
  });
});
