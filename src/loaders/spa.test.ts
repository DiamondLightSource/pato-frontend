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

  it("should filter out extraction processing jobs", async () => {
    server.use(
      rest.get("http://localhost/dataCollections/:collectionId/processingJobs", (req, res, ctx) =>
        res.once(
          ctx.status(200),
          ctx.json({
            items: [
              {
                AutoProcProgram: { autoProcProgramId: 1 },
                ProcessingJob: { recipe: "em-spa-extract" },
                status: "Success",
              },
            ],
          }),
          ctx.delay(0)
        )
      )
    );

    const data = await spaLoader(queryClient)({ groupId: "1" });
    expect(data.jobs).toEqual([]);
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

  it("should return empty parameter list if backend returns 404", async () => {
    server.use(
      rest.get("http://localhost/processingJob/:procJobId/parameters", async (req, res, ctx) =>
        res.once(ctx.status(404))
      )
    );

    const data = await spaLoader(queryClient)({ groupId: "1" });
    expect(data.jobParameters).toEqual({});
  });

  it("should only return file name from gain reference path parameter", async () => {
    server.use(
      rest.get("http://localhost/processingJob/:procJobId/parameters", async (req, res, ctx) =>
        res.once(
          ctx.status(200),
          ctx.json({ motioncor_gainreference: "/dls/some/path/here/gain.mrc" })
        )
      )
    );

    const data = await spaLoader(queryClient)({ groupId: "1" });
    expect(data.jobParameters).toEqual({ gainReferenceFile: "gain.mrc" });
  });

  it("should cast boolean fields in parameter listing to boolean values", async () => {
    const data = await spaLoader(queryClient)({ groupId: "1" });
    expect(data.jobParameters).toEqual({
      doClass2D: false,
      doClass3D: true,
      sphericalAberration: "1",
    });
  });

  it("should include generic parameters without an alias", async () => {
    server.use(
      rest.get("http://localhost/processingJob/:procJobId/parameters", async (req, res, ctx) =>
        res.once(ctx.status(200), ctx.json({ someKey: 1 }))
      )
    );

    const data = await spaLoader(queryClient)({ groupId: "1" });
    expect(data.jobParameters).toEqual({ someKey: 1 });
  });
});
