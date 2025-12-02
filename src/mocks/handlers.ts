import { http, HttpResponse } from "msw";

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
        alignedTotal: 10,
        total: 20,
      };
      break;
    case "2":
      data = {
        items,
        total: 20,
        alignedTotal: 0,
      };
      break;
    case "3":
      data = {
        items: [
          {
            CTF: { comments: "comment!" },
            Movie: { movieId: 1 },
            TiltImageAlignment: { refinedTiltAxis: 958 },
          },
        ],
        total: 20,
        alignedTotal: 10,
      };
      break;
    case "4":
      data = {
        items: [
          {
            CTF: { comments: "comment!" },
            Movie: { movieId: 1 },
            TiltImageAlignment: { refinedTiltAxis: 958 },
          },
        ],
        alignedTotal: "asd",
        total: 10,
      };
      break;
  }
  return data;
};

export const handlers = [
  http.get("http://localhost/autoProc/:id/motion", ({ params }) =>
    HttpResponse.json(getMotionData(params.id!.toString()))
  ),

  http.get("http://localhost/autoProc/:autoProcId/tomogram", () =>
    HttpResponse.json({ tomogramId: 1, dataCollectionId: 1 })
  ),

  http.get("http://localhost/auth/user", () =>
    HttpResponse.json({ givenName: "Person", fedid: "abc12345" })
  ),

  http.get("http://localhost/auth/token", () => HttpResponse.json({})),

  http.get("http://localhost/dataCollections/:collectionId", () =>
    HttpResponse.json({ index: 1, experimentTypeName: "Tomography" })
  ),

  http.get("http://localhost/dataCollections/:collectionId/iceThickness", () =>
    HttpResponse.json({ items: [{ x: 1, y: 1 }] })
  ),

  http.get("http://localhost/dataCollections/:collectionId/totalMotion", () =>
    HttpResponse.json({ items: [{ x: 1, y: 1 }] })
  ),

  http.get("http://localhost/dataCollections/:collectionId/resolution", () =>
    HttpResponse.json({ items: [{ x: 1, y: 1 }] })
  ),

  http.get("http://localhost/dataCollections/:collectionId/attachments", () =>
    HttpResponse.json({ items: [{ fileType: "params", dataCollectionFileAttachmentId: 250 }] })
  ),

  http.get("http://localhost/dataCollections/:collectionId/particles", () =>
    HttpResponse.json({ items: [{ x: 1, y: 1 }] })
  ),

  http.get("http://localhost/dataCollections/:id/motion", () =>
    HttpResponse.json({
      items: [{ Movie: { movieId: 1 }, CTF: {}, MotionCorrection: {} }],
      total: 10,
    })
  ),

  http.get("http://localhost/dataCollections/:id/tomogram-motion", ({ params }) =>
    HttpResponse.json(getMotionData(params.id!.toString()))
  ),

  http.get("http://localhost/movies/:id/fft", () => HttpResponse.text("")),

  http.get("http://localhost/movies/:id/micrograph", () => HttpResponse.text("")),

  http.get("http://localhost/tomograms/:id/centralSlice", () => HttpResponse.text("")),

  http.get("http://localhost/tomograms/:id/movie", () => HttpResponse.text("")),

  http.get("http://localhost/movies/:id/drift", () =>
    HttpResponse.json({ items: [{ x: 1, y: 1 }] })
  ),

  http.get("http://localhost/tomograms/:id/ctf", () =>
    HttpResponse.json({
      items: [
        {
          refinedTiltAngle: 1,
          estimatedResolution: 1,
          estimatedDefocus: 1,
          astigmatism: 1,
        },
      ],
    })
  ),

  http.get("http://localhost/autoProc/:id/ctf", () =>
    HttpResponse.json({
      items: [
        {
          imageNumber: 1,
          estimatedResolution: 1,
          estimatedDefocus: 1,
          astigmatism: 1,
          numberOfParticles: 5,
        },
      ],
    })
  ),

  http.get("http://localhost/tomograms/:tomogramId/shiftPlot", ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      items: [{ x: 1, y: 1 }],
      page: url.searchParams.get("page") ?? 1,
      total: 300,
    });
  }),

  http.get("http://localhost/dataCollections/:collection/tomogram", () =>
    HttpResponse.json({}, { status: 404 })
  ),

  http.get("http://localhost/dataCollections/:collectionId/ctf", () =>
    HttpResponse.json({
      items: [{ x: 1, y: 1 }],
    })
  ),

  http.get("http://localhost/dataCollections/:collectionId/particleCountPerResolution", () =>
    HttpResponse.json({
      items: [{ x: 1, y: 1 }],
    })
  ),

  http.get("http://localhost/invalidEndpoint", () => HttpResponse.json({}, { status: 404 })),

  http.get("http://localhost/autoProc/:procId/particlePicker", ({ params }) => {
    switch (params.procId) {
      case "1":
        return HttpResponse.json({
          items: [{ particlePickerId: null }],
          total: 1,
          limit: 1,
        });
      default:
        return HttpResponse.json({
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
        });
    }
  }),

  http.get("http://localhost/movies/:movieId/iceThickness", () => {
    const dummy = { minimum: 3000, maximum: 10000, median: 5000, q1: 3, q3: 6 };
    return HttpResponse.json({ current: dummy, avg: { ...dummy, stddev: 200 } });
  }),

  http.get("http://localhost/autoProc/:procId/particlePicker/:pickerId/image", () =>
    HttpResponse.json({}, { status: 404 })
  ),

  http.get("http://localhost/dataCollections/:collectionId/processingJobs", () =>
    HttpResponse.json({
      items: [
        {
          AutoProcProgram: { autoProcProgramId: 1 },
          ProcessingJob: {},
          status: "Success",
        },
      ],
    })
  ),

  http.get("http://localhost/dataCollections/:collectionId/tomograms", () =>
    HttpResponse.json({
      items: [
        {
          Tomogram: { tomogramId: 1 },
          AutoProcProgram: { autoProcProgramId: 1 },
          ProcessingJob: {},
          status: "Success",
        },
      ],
    })
  ),

  http.get("http://localhost/tomograms/:tomogramId/projection", () =>
    HttpResponse.json({}, { status: 404 })
  ),

  http.get("http://localhost/autoProc/:autoProcId/classification/:classId/image", () =>
    HttpResponse.json({}, { status: 404 })
  ),

  http.get("http://localhost/autoProc/:autoProcId/particlePicker/:classId/image", () => {
    HttpResponse.text("A", { headers: { "Content-Type": "image/png" } });
  }),

  http.get("http://localhost/autoProc/:procId/classification", ({ request }) => {
    const url = new URL(request.url);
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
        bFactorFitIntercept: 10,
        bFactorFitLinear: 10,
        estimatedResolution: 3,
      },
      {
        particleClassificationId: 2,
        batchNumber: 355,
        classNumber: 1,
        particlesPerClass: 1,
        symmetry: "C8",
        type: "2D",
        selected: true,
        bFactorFitIntercept: 10,
        bFactorFitLinear: 10,
        estimatedResolution: 5,
      },
    ];

    if (url.searchParams.get("sortBy") === "class") {
      items = items.sort((a, b) => (a.classDistribution! > b.classDistribution! ? -1 : 1));
    }

    if (url.searchParams.get("excludeUnselected") === "true") {
      items = items.filter((i) => i.selected !== false);
    }

    return HttpResponse.json({
      items: items,
      total: items.length,
      limit: 8,
    });
  }),

  http.get("http://localhost/autoProc/:procId/classification/:classId/image", () =>
    HttpResponse.json({}, { status: 404 })
  ),

  http.get("http://localhost/proposals/:propId/sessions/:visitId", () =>
    HttpResponse.json({ beamLineName: "m01", sessionId: 1 })
  ),

  http.get("http://localhost/unauthorisedEndpoint", () => HttpResponse.json({}, { status: 401 })),

  http.get("http://localhost/sessions", () =>
    HttpResponse.json({
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
  ),

  http.get("http://localhost/autoProc/:autoProcId/bFactorFit", () =>
    HttpResponse.json({
      items: [
        {
          resolution: 1,
          numberOfParticles: 1,
        },
      ],
    })
  ),

  http.get("http://localhost/proposals/:propId/sessions/:visitId/dataGroups", ({ request }) => {
    const url = new URL(request.url);
    return HttpResponse.json({
      items: withSearch(
        [
          {
            dataCollectionGroupId: 1,
            collections: 1,
            experimentTypeName: "Tomography",
          },
        ],
        url.searchParams.get("search")
      ),
      total: 1,
      limit: 25,
    });
  }),

  http.get("http://localhost/proposals/:propId/sessions/:visitId/reprocessingEnabled", () =>
    HttpResponse.json({
      allowReprocessing: true,
    })
  ),

  http.get("http://localhost/dataGroups/:groupId/dataCollections", () =>
    HttpResponse.json({
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
  ),

  http.post("http://localhost/dataCollections/:collectionId/reprocessing/:type", () =>
    HttpResponse.json({ processingJobId: 1 }, { status: 202 })
  ),

  http.post("http://localhost/proposals/:propId/sessions/:sessionId/dataCollections", () =>
    HttpResponse.json({ dataCollectionId: 1 }, { status: 201 })
  ),

  http.post("http://localhost/proposals/:propId/sessions/:sessionId/processingModel", () =>
    HttpResponse.json({})
  ),

  http.post("http://localhost/proposals/:propId/sessions/:sessionId/initialModel", () =>
    HttpResponse.json({})
  ),

  http.get("http://localhost/processingJob/:procJobId/parameters", () =>
    HttpResponse.json({ items: { do_class3d: "1", do_class2d: "0", Cs: "1" } })
  ),

  http.get("http://localhost/proposals", ({ request }) => {
    const url = new URL(request.url);
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

    return HttpResponse.json({
      items: withSearch(items, url.searchParams.get("search")),
      page: url.searchParams.get("page") ?? 1,
      total: 300,
    });
  }),

  http.get("http://localhost/dataGroups/:dcgId", () =>
    HttpResponse.json({ dataCollectionGroupId: 1 })
  ),

  http.get("http://localhost/dataGroups/:dcgId/atlas", () => HttpResponse.json({ atlasId: 1 })),

  http.get("http://localhost/dataGroups/:dcgId/grid-squares", () =>
    HttpResponse.json({
      items: [{ x: 1, y: 1, width: 1, height: 1, gridSquareId: 1, image: "image.jpg" }],
    })
  ),

  http.get("http://localhost/foil-holes/:foilHoleId/movies", () =>
    HttpResponse.json({ items: [{ movieNumber: 500, movieId: 500 }] })
  ),

  http.get("http://localhost/grid-squares/:gridSquareId/foil-holes", () =>
    HttpResponse.json({
      items: [
        {
          foilHoleId: 500,
          x: 1,
          y: 1,
          diameter: 5,
          movieCount: 1,
          astigmatism: 1,
          particleCount: 5,
          resolution: 9,
        },
        {
          foilHoleId: 501,
          x: 2,
          y: 2,
          diameter: 5,
          movieCount: 0,
          astigmatism: null,
          particleCount: null,
          resolution: null,
        },
      ],
    })
  ),

  http.get("http://localhost/grid-squares/:gridSquareId/tomograms", () =>
    HttpResponse.json({
      items: [
        {
          tomogramId: 500,
          pixelLocationX: 150,
          pixelLocationY: 150,
          sizeX: 500,
          sizeY: 100,
          pixelSpacing: 1,
        },
        {
          tomogramId: 600,
          pixelLocationX: 100,
          pixelLocationY: 100,
          sizeX: 500,
          sizeY: 100,
          pixelSpacing: 1,
        },
      ],
    })
  ),

  http.get("http://localhost/movies/:movieId", () =>
    HttpResponse.json({ movieId: 1, foilHoleId: 2, gridSquareId: 3 })
  ),

  http.post("http://localhost/feedback", () => HttpResponse.json({})),

  http.post("http://localhost/dataGroups/:groupId/alerts", () => HttpResponse.json({})),

  http.patch("http://localhost/me", () =>
    HttpResponse.json({ login: "abc12345", emailAddress: "test@facility.ac.uk" })
  ),
];
