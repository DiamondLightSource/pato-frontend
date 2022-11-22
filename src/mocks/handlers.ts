import { rest } from 'msw'

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
  })
]
