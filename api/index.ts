import { VercelRequest, VercelResponse } from '@vercel/node'
import nanoid from 'nanoid'
import {
  createFilter,
  dbDeleteOne,
  dbFind,
  dbInsertOne,
  dbUpdateOne,
} from './database'
import { HandleResponse } from './utils'

// Types
export interface dbUrlDocument {
  _id: string
  long_url: string
  short_url: string
}

/**
 * @function default
 */
export default async (req: VercelRequest, res: VercelResponse) => {
  const http = new HandleResponse(req, res)
  const method = req.method.toLowerCase() as 'get' | 'post' | 'delete' | 'patch'
  const { query, body } = req

  // Actions
  async function actionGet() {
    if (query?.mode === 'by_short') {
      return http.send(200, undefined, {
        body: await getByShort(query.short_url as string),
      })
    } else if (query?.mode === 'by_long') {
      return http.send(200, undefined, {
        body: await getByLong(query.long_url as string),
      })
    } else if (query?.mode === 'list_all') {
      return http.send(200, undefined, {
        body: await getList(Number(query?.offset), Number(query?.limit)),
      })
    } else {
      return http.send(400, 'Invalid type')
    }
  }

  async function actionPost() {
    if (!body) {
      return http.send(400, 'Missing request body')
    }

    const long_url = body?.long_url
    const short_url = body?.short_url || nanoid.nanoid()

    if (!long_url) {
      return http.send(400, 'Missing long_url')
    }

    try {
      const data = await addUrl(long_url, short_url, body.force)
      return http.send(data.code, data.message, { body: data.body })
    } catch (e) {
      return http.send(e)
    }
  }

  async function actionDelete() {
    const short_url = body?.short_url
    if (!short_url) {
      return http.send(400, 'Missing short_url')
    }

    try {
      return http.send(200, undefined, { body: await removeByShort(short_url) })
    } catch (e) {
      return http.send(e)
    }
  }

  async function actionPatch() {
    return http.send(404, 'In progress...')
  }

  // Switch methods
  switch (method) {
    case 'get':
      return actionGet()
    case 'post':
      return actionPost()
    case 'delete':
      return actionDelete()
    case 'patch':
      return actionPatch()
    default:
      return http.send(400, 'Invalid method')
  }
}

// Random URL
export function getShortCode() {
  return nanoid.nanoid()
}

// Get URL
export async function getList(offset: number, limit: number) {
  return dbFind('url', {}, { limit, skip: offset })
}

export async function getByType(
  type: 'long' | 'short',
  content
): Promise<dbUrlDocument | null> {
  let filter: Record<string, string> = {}
  switch (type) {
    case 'long':
      filter['long_url'] = content
      break
    case 'short':
      filter['short_url'] = content
      break
    default:
      throw { code: 400, message: 'Invalid type' }
  }
  const [data] = await dbFind('url', filter)
  return (data as dbUrlDocument) || null
}

export function getByShort(code: string) {
  return getByType('short', code)
}

export function getByLong(url: string) {
  return getByType('long', url)
}

// Add URL
export async function addUrl(
  long_url: string,
  short_url: string,
  force?: boolean
) {
  const updateData = {
    long_url,
    short_url,
  }

  try {
    const url = new URL(long_url)
    if (!['http:', 'https:'].includes(url.protocol)) throw ''
  } catch (err) {
    throw {
      code: 400,
      message: 'Invalid URL or protocol',
    }
  }

  const [longData, shortData] = await Promise.all([
    getByLong(long_url),
    getByShort(short_url),
  ])

  if (force) {
    if (shortData) {
      updateData.long_url = long_url
    }
  } else {
    if (shortData || longData) {
      return {
        code: shortData ? 409 : 200,
        message: shortData
          ? 'The short code has already been used'
          : 'The URL has already been recorded',
        body: shortData || longData,
      }
    }
  }

  try {
    const dbResult = await dbInsertOne('url', updateData)
    return {
      code: 200,
      message: 'New URL has been added',
      body: updateData,
      dbResult,
    }
  } catch (body) {
    throw {
      code: 500,
      message: 'Database error',
      body,
    }
  }
}

// Update URL
export async function updateLong(short_url, long_url) {
  return dbUpdateOne('url', { short_url }, { $set: { long_url } })
}

// Remove URL
export async function removeUrl(type: 'long' | 'short', content: string) {
  let filter: Record<string, string> = {}
  switch (type) {
    case 'long':
      filter['long_url'] = content
      break
    case 'short':
      filter['short_url'] = content
    default:
      throw { code: 400, message: 'Invalid type' }
  }
  try {
    const dbResult = await dbDeleteOne('url', createFilter([filter]))
    return {
      code: 200,
      message: 'URL has been removed',
      body: {
        type,
        content,
      },
      dbResult,
    }
  } catch (body) {
    throw {
      code: 500,
      message: 'Database error',
      body,
    }
  }
}

export async function removeByLong(long_url) {
  return removeUrl('long', long_url)
}

export async function removeByShort(short_url) {
  return removeUrl('short', short_url)
}
