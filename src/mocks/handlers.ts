import { rest } from 'msw'

export const handlers = [
  rest.get('http://localhost/tomograms/:id/motion', (req, res, ctx) => {
    let data = {}
    const items = [{Movie: {}, CTF: {}, MotionCorrection: {}, TiltImageAlignment: {}}]

    switch(req.params.id) {
      case "1":
        data = {
          items,
          total: 10,
          rawTotal: 20
        }
        break;
      case "2":
        data = {
          items,
          total: 0,
          rawTotal: 20
        }
        break;
      case "3":
        data = {
          items: [{CTF: {comments: "comment!"}, Movie: {}}],
          total: 0,
          rawTotal: 20,
          refinedTiltAxis: 958
        }
        break;
    }

    return res(
      ctx.status(200),
      ctx.json(data)
    )
  }),

  rest.get('http://localhost/dataCollections/:id/motion', (req, res, ctx) => {
    let data = {items: [{Movie: {}, CTF: {}, MotionCorrection: {}}], total: 10}

    return res(
      ctx.status(200),
      ctx.json(data)
    )
  }),

  rest.get('http://localhost/movies/:id/fft', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.body("")
    )
  }),

  rest.get('http://localhost/movies/:id/micrograph', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.body("")
    )
  }),

  rest.get('http://localhost/tomograms/:id/centralSlice', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.body("")
    )
  }),

  rest.get('http://localhost/movies/:id/drift', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({items: [{x: 1, y:1}]})
    )
  }),

  rest.get('http://localhost/tomograms/:id/ctf', (req, res, ctx) => {
    let data: Record<string, number>[] = []

    if (req.params.id === "3") {
      data = [{refinedTiltAngle: 1, estimatedResolution: 1, estimatedDefocus: 1, astigmatism: 1}]
    }
    
    return res(
      ctx.status(200),
      ctx.json({
        items: data
      })
    )
  }),

  rest.get("http://localhost/tomograms/:tomogramId/shiftPlot", async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({items: [
        {x: 1, y:1},
      ], page: req.url.searchParams.get("page") ?? 1, total: 300})
    )
  }),

  rest.get("http://localhost/dataCollections/:collection/tomogram", async (req, res, ctx) => {
    return res(
      ctx.status(404)
    )
  }),

  rest.get("http://localhost/dataCollections", async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json(
        {total: req.url.searchParams.get("onlyTomograms") ? 3 : 5,
        items: [{pixelSizeOnImage: 50, voltage: 1, imageSize: 1}]
        , page: req.url.searchParams.get("page") ?? 1})
    )
  }),

  rest.get("http://localhost/invalidEndpoint", async (req, res, ctx) => {
    return res(
      ctx.status(404),
    )
  }),

  rest.get("http://localhost/autoProc/:procId/particlePicker", async (req, res, ctx) => {
    switch (req.params.procId) {
      case "1":
        return res(
          ctx.status(200),
          ctx.json({items: [{particlePickerId: null}], total: 1, limit: 1})
        )
      case "2":
        return res(
          ctx.status(200),
          ctx.delay(0),
          ctx.json({items: [{particlePickerId: 1, imageNumber: 9999, particleDiameter: 1, numberOfParticles: 1, createdTimestamp: "1"}], total: 1, limit: 1})
        )
    }
    
  }),

  rest.get("http://localhost/autoProc/:procId/particlePicker/:pickerId/image", async (req, res, ctx) => {
    return res(
      ctx.status(404),
    )
  }),

  rest.get("http://localhost/autoProc/:procId/classification", async (req, res, ctx) => {
    if (req.url.searchParams.get("sortBy") === "class") {
      return res(
        ctx.status(200),
        ctx.delay(0),
        ctx.json({items: [{particleClassificationId: 1, classDistribution: 999, classNumber: 1, particlesPerClass: 1, batchNumber: 155, symmetry: "C1", type: "2D"}, 
        {particleClassificationId: 2, batchNumber: 355, classNumber: 1, particlesPerClass: 1, symmetry: "C1", type: "2D"}], total: 2, limit: 8})
      )
    }

    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({items: [{particleClassificationId: 1, classNumber: 1, particlesPerClass: 1, batchNumber: 155, symmetry: "C1", type: "2D"}, 
      {particleClassificationId: 2, batchNumber: 355, classNumber: 1, particlesPerClass: 1, symmetry: "C1", type: "2D"}], total: 2, limit: 8})
    )
  }),

  rest.get("http://localhost/autoProc/:procId/classification/:classId/image", async (req, res, ctx) => {
    return res(
      ctx.status(404),
    )
  }),


  rest.get("http://localhost/unauthorisedEndpoint", async (req, res, ctx) => {
    return res(
      ctx.status(401),
    )
  }),

  rest.get('http://localhost/proposals', (req, res, ctx) => {
    const valueAppend = req.url.searchParams.get("search") ?? ""

    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({items: [
        {key1: "value1" + valueAppend},
        {key2: "value2" + valueAppend},
        {key3: "value3" + valueAppend}
      ], page: req.url.searchParams.get("page") ?? 1, total: 300})
    )
  })
]
