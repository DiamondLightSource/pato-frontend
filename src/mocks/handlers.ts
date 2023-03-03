import { rest } from "msw";

const apng =
  "iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAMAAAC6sdbXAAAACGFjVEwAAAADAAAAAM7tusAAAAAMUExURQMDAwAAAJKSkv8AAGIb5p4AAAABdFJOUwBA5thmAAAAGmZjVEwAAAAAAAAABQAAAAUAAAAAAAAAAAAUAGQAANMipokAAAAOSURBVAjXY2AEAQYcJAABlQAaPUDJKQAAABpmY1RMAAAAAQAAAAUAAAAFAAAAAAAAAAAAFABkAABIUUxdAAAAEmZkQVQAAAACCNdjYAYBBhwkAASDAEy9AgcTAAAAGmZjVEwAAAADAAAABQAAAAUAAAAAAAAAAAAUAGQAAKXHn7QAAAASZmRBVAAAAAQI12NgAgEGHCQAAwwAMyEXezIAAAAbdEVYdFNvZnR3YXJlAEFQTkcgQXNzZW1ibGVyIDIuN8Hj04gAAAAASUVORK5CYII=";

export const handlers = [
  rest.get("http://localhost/tomograms/:id/motion", (req, res, ctx) => {
    let data = {};
    const items = [{ Movie: {}, CTF: {}, MotionCorrection: {}, TiltImageAlignment: {} }];

    switch (req.params.id) {
      case "1":
        data = {
          items,
          total: 10,
          rawTotal: 20,
        };
        break;
      case "2":
        data = {
          items,
          total: 0,
          rawTotal: 20,
        };
        break;
      case "3":
        data = {
          items: [{ CTF: { comments: "comment!" }, Movie: {}, TiltImageAlignment: { refinedTiltAxis: 958 } }],
          total: 0,
          rawTotal: 20,
        };
        break;
      case "4":
        data = {
          items: [{ CTF: { comments: "comment!" }, Movie: {}, TiltImageAlignment: { refinedTiltAxis: 958 } }],
          rawTotal: "asd",
        };
        break;
    }

    return res(ctx.status(200), ctx.delay(0), ctx.json(data));
  }),

  rest.get("http://localhost/autoProc/:autoProcId/tomogram", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ tomogramId: 1, dataCollectionId: 1 }), ctx.delay(0));
  }),

  rest.get("http://localhost/dataCollections/:collectionId/iceThickness", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ items: [{ x: 1, y: 1 }] }), ctx.delay(0));
  }),

  rest.get("http://localhost/dataCollections/:collectionId/totalMotion", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ items: [{ x: 1, y: 1 }] }), ctx.delay(0));
  }),

  rest.get("http://localhost/dataCollections/:collectionId/resolution", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ items: [{ x: 1, y: 1 }] }), ctx.delay(0));
  }),

  rest.get("http://localhost/dataCollections/:collectionId/particles", (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ items: [{ x: 1, y: 1 }] }), ctx.delay(0));
  }),

  rest.get("http://localhost/dataCollections/:id/motion", (req, res, ctx) => {
    if (req.params.id === "9") {
      return res(ctx.status(404));
    }

    let data = { items: [{ Movie: {}, CTF: {}, MotionCorrection: {} }], total: 10 };

    return res(ctx.status(200), ctx.delay(0), ctx.json(data));
  }),

  rest.get("http://localhost/movies/:id/fft", (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(0), ctx.body(""));
  }),

  rest.get("http://localhost/movies/:id/micrograph", (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(0), ctx.body(""));
  }),

  rest.get("http://localhost/tomograms/:id/centralSlice", (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(0), ctx.body(""));
  }),

  rest.get("http://localhost/movies/:id/drift", (req, res, ctx) => {
    return res(ctx.delay(0), ctx.status(200), ctx.json({ items: [{ x: 1, y: 1 }] }));
  }),

  rest.get("http://localhost/tomograms/:id/ctf", (req, res, ctx) => {
    let data: Record<string, number>[] = [];

    if (req.params.id === "3") {
      data = [{ refinedTiltAngle: 1, estimatedResolution: 1, estimatedDefocus: 1, astigmatism: 1 }];
    }

    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: data,
      })
    );
  }),

  rest.get("http://localhost/autoProc/:id/ctf", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: [{ imageNumber: 1, estimatedResolution: 1, estimatedDefocus: 1, astigmatism: 1 }],
      })
    );
  }),

  rest.get("http://localhost/tomograms/:tomogramId/shiftPlot", async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({ items: [{ x: 1, y: 1 }], page: req.url.searchParams.get("page") ?? 1, total: 300 })
    );
  }),

  rest.get("http://localhost/dataCollections/:collection/tomogram", async (req, res, ctx) => {
    return res(ctx.status(404));
  }),

  rest.get("http://localhost/invalidEndpoint", async (req, res, ctx) => {
    return res(ctx.status(404));
  }),

  rest.get("http://localhost/autoProc/:procId/particlePicker", async (req, res, ctx) => {
    switch (req.params.procId) {
      case "1":
        return res(
          ctx.status(200),
          ctx.delay(0),
          ctx.json({ items: [{ particlePickerId: null }], total: 1, limit: 1 })
        );
      case "2":
        return res(
          ctx.status(200),
          ctx.delay(0),
          ctx.json({
            items: [
              {
                particlePickerId: 1,
                imageNumber: 9999,
                particleDiameter: 1,
                numberOfParticles: 1,
                createdTimestamp: "1",
              },
            ],
            total: 1,
            limit: 1,
          })
        );
      case "3":
        return res(ctx.status(404), ctx.delay(0));
    }
  }),

  rest.get("http://localhost/tomograms/:tomogramId/movie", async (req, res, ctx) => {
    const buffer = Buffer.from(apng, "base64");

    if (req.params.tomogramId === "1") {
      return res(
        ctx.status(200),
        ctx.set("Content-Type", "image/png"),
        ctx.body(buffer),
        ctx.delay(0),
        ctx.set("Content-Length", buffer.length.toString())
      );
    }

    return res(ctx.status(404));
  }),

  rest.get("http://localhost/movies/:movieId/iceThickness", async (req, res, ctx) => {
    const dummy = { minimum: 1, maximum: 10, median: 5, q1: 3, q3: 6 };
    return res(ctx.status(200), ctx.delay(0), ctx.json({ current: dummy, avg: dummy }));
  }),

  rest.get("http://localhost/autoProc/:procId/particlePicker/:pickerId/image", async (req, res, ctx) => {
    return res(ctx.status(404));
  }),

  rest.get("http://localhost/dataCollections/:collectionId/processingJobs", async (req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ items: [{ autoProcProgramId: 1 }] }));
  }),

  rest.get("http://localhost/tomograms/:tomogramId/projection", async (req, res, ctx) => {
    return res(ctx.status(404));
  }),

  rest.get("http://localhost/autoProc/:procId/classification", async (req, res, ctx) => {
    if (req.params.procId === "2") {
      return res(ctx.status(404));
    }

    if (req.url.searchParams.get("sortBy") === "class") {
      return res(
        ctx.status(200),
        ctx.delay(0),
        ctx.json({
          items: [
            {
              particleClassificationId: 1,
              classDistribution: 999,
              classNumber: 1,
              particlesPerClass: 1,
              batchNumber: 155,
              symmetry: "C1",
              type: "2D",
            },
            {
              particleClassificationId: 2,
              batchNumber: 355,
              classNumber: 1,
              particlesPerClass: 1,
              symmetry: "C1",
              type: "2D",
            },
          ],
          total: 2,
          limit: 8,
        })
      );
    }

    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: [
          {
            particleClassificationId: 1,
            classNumber: 1,
            particlesPerClass: 1,
            batchNumber: 155,
            symmetry: "C1",
            type: "2D",
          },
          {
            particleClassificationId: 2,
            batchNumber: 355,
            classNumber: 1,
            particlesPerClass: 1,
            symmetry: "C1",
            type: "2D",
          },
        ],
        total: 2,
        limit: 8,
      })
    );
  }),

  rest.get("http://localhost/autoProc/:procId/classification/:classId/image", async (req, res, ctx) => {
    return res(ctx.status(404));
  }),

  rest.get("http://localhost/unauthorisedEndpoint", async (req, res, ctx) => {
    return res(ctx.status(401));
  }),

  rest.get("http://localhost/sessions", (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: [
          {
            proposalId: 999,
            beamLineName: "m01",
            sessionId: 1,
            parentProposal: "cm31111",
            visit_number: 1,
            startDate: "2023-01-01T09:00",
            endDate: "2023-01-01T09:00",
          },
        ],
      })
    );
  }),

  rest.get("http://localhost/dataGroups/:groupId/dataCollections", async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            dataCollectionId: 9775784,
            SESSIONID: 27489608,
            fileTemplate: "/dls/files/GridSquare_11_1/",
          },
        ],
        total: 80,
        limit: 25,
      })
    );
  }),

  rest.get("http://localhost/proposals", (req, res, ctx) => {
    const valueAppend = req.url.searchParams.get("search") ?? "";

    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: [{ key1: "value1" + valueAppend }, { key2: "value2" + valueAppend }, { key3: "value3" + valueAppend }],
        page: req.url.searchParams.get("page") ?? 1,
        total: 300,
      })
    );
  }),
];
