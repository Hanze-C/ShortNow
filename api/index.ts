import { VercelRequest, VercelResponse } from '@vercel/node'
import shortid from 'shortid'
import {
  createFilter,
  dbDeleteOne,
  dbFind,
  dbInsertOne,
  dbUpdateOne,
} from './database'
import { HandleError } from './utils'

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
  const handleError = new HandleError(req, res)
  const method = req.method.toLowerCase() as 'get' | 'post' | 'delete' | 'patch'
  const { query, body } = req

  // Actions
  async function actionGet() {
    if (query.type === 'by_short') {
      return res.send({
        code: 200,
        body: await getByShort(query.short_url as string),
      })
    } else if (query.type === 'by_long') {
      return res.send({
        code: 200,
        body: await getByLong(query.long_url as string),
      })
    } else if (query.type === 'list_all') {
      return res.send({
        code: 200,
        body: await getList(Number(query.limit), Number(query.offset)),
      })
    } else {
      return handleError.send({ code: 400, message: 'Invalid type' })
    }
  }

  async function actionPost() {
    if (!body) {
      return handleError.send({
        code: 400,
        message: 'Missing body',
      })
    }

    const long_url = body.long_url
    const short_url = body.short_url || shortid.generate()

    if (!long_url) {
      return handleError.send({ code: 400, message: 'Missing long_url' })
    }

    try {
      return res.send(await addUrl(long_url, short_url, body.force))
    } catch (e) {
      return handleError.send(e)
    }
  }

  async function actionDelete() {
    const short_url = body.short_url
    if (!short_url) {
      return handleError.send({ code: 400, message: 'Missing short_url' })
    }

    try {
      return res.send({ code: 200, body: await removeByShort(short_url) })
    } catch (e) {
      return handleError.send(e)
    }
  }

  async function actionPatch() {
    return res.status(404).send({ code: 404, message: 'In progress...' })
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
      return handleError.send({ code: 400, message: 'Invalid method' })
  }
}

// Random URL
export function getShortCode() {
  return shortid.generate()
}

// Get URL
export async function getList(limit: number, offset: number) {
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

  if (!shortid.isValid(short_url)) {
    throw {
      code: 400,
      message: 'Invalid short_url',
    }
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
    if (longData || shortData) {
      throw {
        code: 403,
        message: shortData
          ? 'The short code has already been used'
          : 'The URL has already been recorded',
        longData,
        shortData,
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
