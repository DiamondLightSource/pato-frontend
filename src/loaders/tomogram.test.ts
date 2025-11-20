import { http, HttpResponse } from "msw";
import { server } from "mocks/server";
import { tomogramLoader } from "loaders/tomogram";
import { queryClient } from "utils/test-utils";

const request = new Request(
  "https://localhost/proposals/cm33915/sessions/7/groups/8557661/tomograms/52?onlyTomograms=false"
);

describe("Tomogram Data", () => {
  it("should return data for jobs and collections if both are available", async () => {
    const data = await tomogramLoader(queryClient)({ groupId: "1" }, request);

    if (data instanceof Response) {
      return;
    }

    expect(data.collection.dataCollectionId).toBe(9775784);
    expect(data.tomograms).not.toBe(null);
  });

  it("should return data for jobs and collections without explicit tomogram filter", async () => {
    const noOnlyRequest = new Request(
      "https://localhost/proposals/cm33915/sessions/7/groups/8557661/tomograms/52"
    );

    const data = await tomogramLoader(queryClient)({ groupId: "1" }, noOnlyRequest);

    if (data instanceof Response) {
      return;
    }

    expect(data.collection.dataCollectionId).toBe(9775784);
    expect(data.tomograms).not.toBe(null);
  });

  it("should return base object if no data collection is available", async () => {
    server.use(
      http.get(
        "http://localhost/dataGroups/:groupId/dataCollections",
        () => HttpResponse.json({}, { status: 404 }),
        {
          once: true,
        }
      )
    );

    const data = await tomogramLoader(queryClient)({ groupId: "1" }, request);

    if (data instanceof Response) {
      return;
    }

    expect(data.collection.info.length).toBe(0);
    expect(data.tomograms).toBe(null);
  });

  it("should return null jobs object if there are no jobs in the collection", async () => {
    server.use(
      http.get(
        "http://localhost/dataCollections/:collectionId/tomograms",
        () => HttpResponse.json({}, { status: 404 }),
        { once: true }
      )
    );

    const data = await tomogramLoader(queryClient)({ groupId: "1" }, request);

    if (data instanceof Response) {
      return;
    }

    expect(data.collection.dataCollectionId).toBe(9775784);
    expect(data.tomograms).toBe(null);
  });

  it("should return redirection if collection index is greater than number of available collecitons", async () => {
    const data = await tomogramLoader(queryClient)(
      { groupId: "1", collectionIndex: "900" },
      request
    );
    expect(data).toBeInstanceOf(Response);
  });

  it("should return reprocessing decision from server", async () => {
    const data = await tomogramLoader(queryClient)(
      { groupId: "1", propId: "cm1", visitId: "1" },
      request
    );

    expect(data.allowReprocessing).toBe(true);
  });

  it("should not return items which do not have valid processing job types", async () => {
    server.use(
      http.get(
        "http://localhost/dataCollections/:collectionId/tomograms",
        () =>
          HttpResponse.json({
            items: [
              { ProcessingJob: { recipe: "not-valid" } },
              { ProcessingJob: { recipe: "em-tomo-align" } },
            ],
          }),
        { once: true }
      )
    );

    const data = await tomogramLoader(queryClient)(
      { groupId: "1", propId: "cm1", visitId: "1" },
      request
    );

    expect(data.tomograms).toHaveLength(1);
  });
});
