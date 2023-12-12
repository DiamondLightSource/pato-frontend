import { rest } from "msw";

const withSearch = (items: Record<string, any>[], search?: string | null) =>
  items.filter((item) => !search || (item.proposalCode + item.proposalNumber).includes(search));

const getMotionData = (parentId: string) => {
  let data = {};
  const items = [
    {
      Movie: { movieId: 1 },
      CTF: {},
      MotionCorrection: {},
      TiltImageAlignment: {},
    },
  ];

  switch (parentId) {
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
        items: [
          {
            CTF: { comments: "comment!" },
            Movie: {},
            TiltImageAlignment: { refinedTiltAxis: 958 },
          },
        ],
        total: 0,
        rawTotal: 20,
      };
      break;
    case "4":
      data = {
        items: [
          {
            CTF: { comments: "comment!" },
            Movie: {},
            TiltImageAlignment: { refinedTiltAxis: 958 },
          },
        ],
        rawTotal: "asd",
        total: 10,
      };
      break;
  }
  return data;
};

export const handlers = [
  rest.get("http://localhost/tomograms/:id/motion", (req, res, ctx) =>
    res(ctx.status(200), ctx.delay(0), ctx.json(getMotionData(req.params.id.toString())))
  ),

  rest.get("http://localhost/autoProc/:id/motion", (req, res, ctx) => {
    return res(ctx.status(200), ctx.delay(0), ctx.json(getMotionData(req.params.id.toString())));
  }),

  rest.get("http://localhost/autoProc/:autoProcId/tomogram", (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ tomogramId: 1, dataCollectionId: 1 }), ctx.delay(0))
  ),

  rest.get("http://localhost/auth/user", (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ givenName: "Person", fedid: "abc12345" }))
  ),

  rest.get("http://localhost/auth/token", (req, res, ctx) => res(ctx.status(200))),

  rest.get("http://localhost/dataCollections/:collectionId/iceThickness", (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ items: [{ x: 1, y: 1 }] }), ctx.delay(0))
  ),

  rest.get("http://localhost/dataCollections/:collectionId/totalMotion", (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ items: [{ x: 1, y: 1 }] }), ctx.delay(0))
  ),

  rest.get("http://localhost/dataCollections/:collectionId/resolution", (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ items: [{ x: 1, y: 1 }] }), ctx.delay(0))
  ),

  rest.get("http://localhost/dataCollections/:collectionId/particles", (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ items: [{ x: 1, y: 1 }] }), ctx.delay(0))
  ),

  rest.get("http://localhost/dataCollections/:id/motion", (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: [{ Movie: {}, CTF: {}, MotionCorrection: {} }],
        total: 10,
      })
    )
  ),

  rest.get("http://localhost/movies/:id/fft", (req, res, ctx) =>
    res(ctx.status(200), ctx.delay(0), ctx.body(""))
  ),

  rest.get("http://localhost/movies/:id/micrograph", (req, res, ctx) =>
    res(ctx.status(200), ctx.delay(0), ctx.body(""))
  ),

  rest.get("http://localhost/tomograms/:id/centralSlice", (req, res, ctx) =>
    res(ctx.status(200), ctx.delay(0), ctx.body(""))
  ),

  rest.get("http://localhost/movies/:id/drift", (req, res, ctx) =>
    res(ctx.delay(0), ctx.status(200), ctx.json({ items: [{ x: 1, y: 1 }] }))
  ),

  rest.get("http://localhost/tomograms/:id/ctf", (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: [
          {
            refinedTiltAngle: 1,
            estimatedResolution: 1,
            estimatedDefocus: 1,
            astigmatism: 1,
          },
        ],
      })
    )
  ),

  rest.get("http://localhost/autoProc/:id/ctf", (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: [
          {
            imageNumber: 1,
            estimatedResolution: 1,
            estimatedDefocus: 1,
            astigmatism: 1,
          },
        ],
      })
    )
  ),

  rest.get("http://localhost/tomograms/:tomogramId/shiftPlot", (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: [{ x: 1, y: 1 }],
        page: req.url.searchParams.get("page") ?? 1,
        total: 300,
      })
    )
  ),

  rest.get("http://localhost/dataCollections/:collection/tomogram", (req, res, ctx) =>
    res(ctx.status(404))
  ),

  rest.get("http://localhost/invalidEndpoint", (req, res, ctx) => res(ctx.status(404))),

  rest.get("http://localhost/autoProc/:procId/particlePicker", (req, res, ctx) => {
    switch (req.params.procId) {
      case "1":
        return res(
          ctx.status(200),
          ctx.delay(0),
          ctx.json({
            items: [{ particlePickerId: null }],
            total: 1,
            limit: 1,
          })
        );
      default:
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
            total: 3,
            limit: 1,
          })
        );
    }
  }),

  rest.get("http://localhost/movies/:movieId/iceThickness", (req, res, ctx) => {
    const dummy = { minimum: 1, maximum: 10, median: 5, q1: 3, q3: 6 };
    return res(ctx.status(200), ctx.delay(0), ctx.json({ current: dummy, avg: dummy }));
  }),

  rest.get("http://localhost/autoProc/:procId/particlePicker/:pickerId/image", (req, res, ctx) =>
    res(ctx.status(404))
  ),

  rest.get("http://localhost/dataCollections/:collectionId/processingJobs", (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            AutoProcProgram: { autoProcProgramId: 1 },
            ProcessingJob: {},
            status: "Success",
          },
        ],
      })
    )
  ),

  rest.get("http://localhost/dataCollections/:collectionId/tomograms", (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            Tomogram: { tomogramId: 1 },
            AutoProcProgram: { autoProcProgramId: 1 },
            ProcessingJob: {},
            status: "Success",
          },
        ],
      })
    )
  ),

  rest.get("http://localhost/tomograms/:tomogramId/projection", (req, res, ctx) =>
    res(ctx.status(404))
  ),

  rest.get(
    "http://localhost/autoProc/:autoProcId/classification/:classId/image",
    (req, res, ctx) => {
      res(ctx.status(404), ctx.delay(0));
    }
  ),

  rest.get(
    "http://localhost/autoProc/:autoProcId/particlePicker/:classId/image",
    (req, res, ctx) => {
      res(ctx.status(200), ctx.body("A"), ctx.set("Content-Type", "image/png"));
    }
  ),

  rest.get("http://localhost/autoProc/:procId/classification", (req, res, ctx) => {
    let items = [
      {
        particleClassificationId: 1,
        classDistribution: 999,
        classNumber: 1,
        particlesPerClass: 1,
        batchNumber: 155,
        symmetry: "C1",
        type: "2D",
        selected: false,
      },
      {
        particleClassificationId: 2,
        batchNumber: 355,
        classNumber: 1,
        particlesPerClass: 1,
        symmetry: "C1",
        type: "2D",
        selected: true,
      },
    ];

    if (req.url.searchParams.get("sortBy") === "class") {
      items = items.sort((a, b) => (a.classDistribution! > b.classDistribution! ? -1 : 1));
    }

    if (req.url.searchParams.get("excludeUnselected") === "true") {
      items = items.filter((i) => i.selected !== false);
    }

    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: items,
        total: items.length,
        limit: 8,
      })
    );
  }),

  rest.get("http://localhost/autoProc/:procId/classification/:classId/image", (req, res, ctx) =>
    res(ctx.status(404), ctx.delay(0))
  ),

  rest.get("http://localhost/proposals/:propId/sessions/:visitId", (req, res, ctx) =>
    res(ctx.status(200), ctx.json({beamLineName: "m01", sessionId: 1}), ctx.delay(0))
  ),

  rest.get("http://localhost/unauthorisedEndpoint", (req, res, ctx) => res(ctx.status(401))),

  rest.get("http://localhost/sessions", (req, res, ctx) =>
    res(
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
    )
  ),

  rest.get("http://localhost/dataGroups", (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        items: withSearch(
          [
            {
              dataCollectionGroupId: 1,
              collections: 1,
              experimentTypeName: "Tomogram",
            },
          ],
          req.url.searchParams.get("search")
        ),
        total: 1,
        limit: 25,
      })
    )
  ),

  rest.get("http://localhost/dataGroups/:groupId/dataCollections", (req, res, ctx) =>
    res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            dataCollectionId: 9775784,
            SESSIONID: 27489608,
            fileTemplate: "/dls/files/GridSquare_11_1/",
            comments: "Sample Tomogram",
          },
        ],
        total: 80,
        limit: 25,
      })
    )
  ),

  rest.post("http://localhost/dataCollections/:collectionId/reprocessing/:type", (req, res, ctx) =>
    res(ctx.status(202), ctx.json({ processingJobId: 1 }))
  ),

  rest.get("http://localhost/processingJob/:procJobId/parameters", (req, res, ctx) =>
    res(ctx.status(200), ctx.json({ do_class3d: "1", do_class2d: "0", Cs: "1" }))
  ),

  rest.get("http://localhost/proposals", (req, res, ctx) => {
    const items = [
      {
        proposalCode: "cm",
        proposalNumber: "31111",
        label: "Number",
        sessions: 1,
        title: "Sample Proposal 1",
      },
      {
        proposalCode: "cm",
        proposalNumber: "31112",
        label: "Number",
        sessions: 1,
        title: "Sample Proposal 2",
      },
      {
        proposalCode: "cm",
        proposalNumber: "31113",
        label: "Number",
        sessions: 1,
        title: "Sample Proposal 3",
      },
      {
        proposalCode: "cm",
        proposalNumber: "31114",
        label: "Number",
        sessions: 1,
        title: "Sample Proposal 4",
      },
    ];

    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({
        items: withSearch(items, req.url.searchParams.get("search")),
        page: req.url.searchParams.get("page") ?? 1,
        total: 300,
      })
    );
  }),
];
