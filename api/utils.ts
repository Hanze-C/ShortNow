import { VercelRequest, VercelResponse } from '@vercel/node'

interface ErrorHttpReturnBody {
  code: number
  message: string
  body?: any
}

export class HandleError {
  req: VercelRequest
  res: VercelResponse

  constructor(req: VercelRequest, res: VercelResponse) {
    this.req = req
    this.res = res
  }

  send(error: ErrorHttpReturnBody) {
    this.res.status(error.code).send(error)
  }
}
