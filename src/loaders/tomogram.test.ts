import { rest } from "msw";
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
    expect(data.jobs).not.toBe(null);
  });

  it("should return data for jobs and collections without explicit tomogram filter", async () => {
    const noOnlyRequest = new Request("https://localhost/proposals/cm33915/sessions/7/groups/8557661/tomograms/52");

    const data = await tomogramLoader(queryClient)({ groupId: "1" }, noOnlyRequest);

    if (data instanceof Response) {
      return;
    }

    expect(data.collection.dataCollectionId).toBe(9775784);
    expect(data.jobs).not.toBe(null);
  });

  it("should return base object if no data collection is available", async () => {
    server.use(
      rest.get("http://localhost/dataGroups/:groupId/dataCollections", (req, res, ctx) => {
        return res.once(ctx.status(404), ctx.delay(0));
      })
    );

    const data = await tomogramLoader(queryClient)({ groupId: "1" }, request);

    if (data instanceof Response) {
      return;
    }

    expect(data.collection.info.length).toBe(0);
    expect(data.jobs).toBe(null);
  });

  it("should return null jobs object if there are no jobs in the collection", async () => {
    server.use(
      rest.get("http://localhost/dataCollections/:collectionId/processingJobs", (req, res, ctx) => {
        return res.once(ctx.status(404), ctx.delay(0));
      })
    );

    const data = await tomogramLoader(queryClient)({ groupId: "1" }, request);

    if (data instanceof Response) {
      return;
    }

    expect(data.collection.dataCollectionId).toBe(9775784);
    expect(data.jobs).toBe(null);
  });

  it("should return redirection if collection index is greater than number of available collecitons", async () => {
    const data = await tomogramLoader(queryClient)({ groupId: "1", collectionIndex: "900" }, request);
    expect(data).toBeInstanceOf(Response);
  });
});
