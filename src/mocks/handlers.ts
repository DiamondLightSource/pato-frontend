import { rest } from 'msw'

interface LoginRequestBody {
  plugin: string,
  username: string,
  password: string
}

export const handlers = [
  rest.post<LoginRequestBody, {token: string}>('http://127.0.0.1:8000/mock/login', async (req, res, ctx) => {
    sessionStorage.setItem('is-authenticated', 'true')
    const {username} = await req.json()
    if(username === "test"){
      return res(
        ctx.delay(2000),
        ctx.status(200),
        ctx.json({
          token: '1234asda'
        })
      )
    } else {
      return res(
        ctx.status(401)
      )
    }
  }),

  rest.post('http://127.0.0.1:8000/mock/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: '1234asda'
      })
    )
  }),

  rest.get('http://127.0.0.1:8000/tomograms?collection=collectionId', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({items: [{
        volumeFile: "/dls/m06/test",
        pixelSpacing: 0.1,
        stackFile: "/dls/m06/test",
        zShift: 0.1,
        tiltAngleOffset: 0.1,
        tomogramId: 1,
      }]})
    )
  })
]
