import { VercelRequest, VercelResponse } from '@vercel/node'

interface HttpResponseBody {
  code: number
  message: string
  body?: any
}

export class HandleResponse {
  req: VercelRequest
  res: VercelResponse

  constructor(req: VercelRequest, res: VercelResponse) {
    this.req = req
    this.res = res
  }

  send(code: number, message?: string, custom?: any) {
    return this.res.status(code).send({ code, message, ...custom })
  }

  axiosError(err: any) {
    return this.res
      .status(err?.response?.status || 500)
      .send(err?.response?.data || err)
  }
}
