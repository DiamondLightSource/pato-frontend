import { rest } from 'msw'

export const handlers = [
  rest.get('http://localhost/motion/:movieId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        total: 10,
        rawTotal: 20
      })
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
    return res(
      ctx.status(200),
      ctx.json({
        items: []
      })
    )
  })
]
