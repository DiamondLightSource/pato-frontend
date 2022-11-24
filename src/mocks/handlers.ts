import { rest } from 'msw'

const image = "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAIAQMAAAD+wSzIAAAABlBMVEX///+/v7+jQ3Y5AAAADklEQVQI12P4AIX8EAgALgAD/aNpbtEAAAAASUVORK5CYII"

export const handlers = [
  rest.get('http://localhost/motion/:movieId', (req, res, ctx) => {
    let data = {}

    switch(req.params.movieId) {
      case "1":
        data = {
          total: 10,
          rawTotal: 20
        }
        break;
      case "2":
        data = {
          total: 0,
          rawTotal: 20
        }
        break;
      case "3":
        data = {
          total: 0,
          rawTotal: 20,
          comments_CTF: "comment!"
        }
        break;
    }

    return res(
      ctx.status(200),
      ctx.json(data)
    )
  }),

  rest.get('http://localhost/image/fft/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.body("")
    )
  }),

  rest.get('http://localhost/image/micrograph/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.body("")
    )
  }),

  rest.get('http://localhost/image/slice/:id', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.body("")
    )
  }),

  rest.get('http://localhost/ctf/:id', (req, res, ctx) => {
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

  rest.get("http://localhost/shiftPlot/:tomogramId", async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json({items: [
        {x: 1, y:1},
      ], page: req.url.searchParams.get("page") ?? 1, total: 300})
    )
  }),

  rest.get("http://localhost/tomograms/:tomogram", async (req, res, ctx) => {
    return res(
      ctx.status(404)
    )
  }),

  rest.get("http://localhost/dataCollections", async (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.delay(0),
      ctx.json(
        {total: 5,
        items: [{pixelSizeOnImage: 50, voltage: 1, imageSize: 1}]
        , page: req.url.searchParams.get("page") ?? 1})
    )
  }),

  rest.get("http://localhost/invalidEndpoint", async (req, res, ctx) => {
    return res(
      ctx.status(404),
    )
  }),

  rest.get('http://localhost/proposals', (req, res, ctx) => {
    const valueAppend = req.url.searchParams.get("s") ?? ""

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
