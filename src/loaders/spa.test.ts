import { rest } from "msw";
import { server } from "mocks/server";
import { spaLoader } from "loaders/spa";
import { queryClient } from "utils/test-utils";

describe("SPA Data", () => {
  it("should return data for jobs and collections if both are available", async () => {
    const data = await spaLoader(queryClient)({ groupId: "1" });
    expect(data.collection.dataCollectionId).toBe(9775784);
    expect(data.collection.info[0].value).toBe("EPU");
    expect(data.jobs![0].AutoProcProgram.autoProcProgramId).toBe(1);
  });

  it("should return base object if no data collection is available", async () => {
    server.use(
      rest.get("http://localhost/dataGroups/:groupId/dataCollections", (req, res, ctx) =>
        res.once(ctx.status(404), ctx.delay(0))
      )
    );

    const data = await spaLoader(queryClient)({ groupId: "1" });
    expect(data.collection.info.length).toBe(0);
    expect(data.jobs).toBe(null);
  });

  it("should return null jobs object if there are no jobs in the collection", async () => {
    server.use(
      rest.get("http://localhost/dataCollections/:collectionId/processingJobs", (req, res, ctx) =>
        res.once(ctx.status(404), ctx.delay(0))
      )
    );

    const data = await spaLoader(queryClient)({ groupId: "1" });
    expect(data.collection.dataCollectionId).toBe(9775784);
    expect(data.jobs).toBe(null);
  });

  it("should display acquisition software as SerialEM depending on fileTemplate", async () => {
    server.use(
      rest.get("http://localhost/dataGroups/:groupId/dataCollections", async (req, res, ctx) =>
        res.once(
          ctx.status(200),
          ctx.json({
            items: [
              {
                dataCollectionId: 9775784,
                SESSIONID: 27489608,
                fileTemplate: "/dls/files/Frames/",
              },
            ],
          })
        )
      )
    );

    const data = await spaLoader(queryClient)({ groupId: "1" });
    expect(data.collection.dataCollectionId).toBe(9775784);
    expect(data.collection.info[0].value).toBe("SerialEM");
  });

  it("should return empty acquisition software if fileTemplate is non-standard", async () => {
    server.use(
      rest.get("http://localhost/dataGroups/:groupId/dataCollections", async (req, res, ctx) =>
        res.once(
          ctx.status(200),
          ctx.json({
            items: [
              {
                dataCollectionId: 9775784,
                SESSIONID: 27489608,
                fileTemplate: "/dls/files/nonStandard",
              },
            ],
          })
        )
      )
    );

    const data = await spaLoader(queryClient)({ groupId: "1" });
    expect(data.collection.dataCollectionId).toBe(9775784);
    expect(data.collection.info[0].value).toBe("");
  });
});
