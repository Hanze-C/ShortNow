import { VercelRequest, VercelResponse } from '@vercel/node'
import { stringify } from 'querystring'
import { getByShort } from './action'

export default async (req: VercelRequest, res: VercelResponse) => {
  const short_url = (req.query.short_url as string) || ''
  const url = await getByShort(short_url)

  if (!url) {
    return res.redirect(`/invalid?` + stringify({ type: 'decode', short_url }))
  }

  res.redirect(url.long_url)
}
