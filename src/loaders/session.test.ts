import { server } from "mocks/server";
import { http, HttpResponse } from "msw";
import { queryClient } from "utils/test-utils";
import { handleGroupClicked, sessionPageLoader } from "loaders/session";

const request = new Request("http://localhost/proposals/");

describe("Session Data", () => {
  it("should return data for session if available", async () => {
    const data = await sessionPageLoader(queryClient)(request, { propId: "1", visitId: "1" });

    expect(data.items).toHaveLength(1);
    expect(data.session).toMatchObject({ beamLineName: "m01" });
  });

  it("should return null if session request fails", async () => {
    server.use(
      http.get(
        "http://localhost/proposals/:propId/sessions/:visitId",
        () => HttpResponse.json({}, { status: 404 }),
        {
          once: true,
        }
      )
    );
    const data = await sessionPageLoader(queryClient)(request, { propId: "1", visitId: "1" });

    expect(data.items).toBe(null);
    expect(data.session).toBe(null);
  });

  it("should return empty list if data collection groups request fails", async () => {
    server.use(
      http.get(
        "http://localhost/proposals/cm1/sessions/1/dataGroups",
        () => HttpResponse.json({}, { status: 404 }),
        {
          once: true,
        }
      )
    );
    const data = await sessionPageLoader(queryClient)(request, { propId: "cm1", visitId: "1" });

    expect(data.items).toEqual([]);
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

  it("should redirect user to tomogram page if experimentType is tomo and no experimentTypeName is present", () => {
    expect(handleGroupClicked({ experimentType: "tomo", dataCollectionGroupId: 1 })).toBe(
      "groups/1/tomograms/1"
    );
  });

  it("should give experimentTypeName precedence over experimentType", () => {
    expect(
      handleGroupClicked({
        experimentTypeName: "Single Particle",
        experimentType: "tomo",
        dataCollectionGroupId: 1,
      })
    ).toBe("groups/1/spa");
  });
});
