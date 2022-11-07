import { rest } from 'msw'

interface LoginRequestBody {
  plugin: string,
  username: string,
  password: string
}

export const handlers = [
  rest.post<LoginRequestBody, {token: string}>('http://127.0.0.1:8000/login', async (req, res, ctx) => {
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

  rest.post('http://127.0.0.1:8000/logout', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        token: '1234asda'
      })
    )
  }),

  rest.get('http://127.0.0.1:8000/motion/:movie', (req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        total: 10,
        rawTotal: 20
      })
    )
  })
]
