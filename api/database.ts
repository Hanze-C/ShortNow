import {
  MongoClient,
  Db,
  Collection,
  UpdateResult,
  DeleteResult,
  InsertOneResult,
  Filter,
  FindOptions,
  Document,
  Projection,
  UpdateFilter,
} from 'mongodb'
const dbName = process.env.SHORT_NOW_DB || 'short-url-now'
const uri = process.env.MONGODB_URI || 'mongodb://localhost'

declare module 'mongodb' {
  export interface Db {
    _client: MongoClient
  }
  export interface Collection {
    _client: MongoClient
  }
}

export function dbConnect(): Promise<Db> {
  return new Promise((next, reject) => {
    const client = new MongoClient(uri, {})
    client.connect(async (error) => {
      if (error) {
        client.close()
        return reject(error)
      }
      const db = client.db(dbName)
      db._client = client
      next(db)
    })
  })
}

export function dbCollection(collection: string): Promise<Collection> {
  return new Promise(async (next, reject) => {
    const db = await dbConnect()
    const col = db.collection(collection)
    col._client = db._client
    next(col)
  })
}

export function dbFind(
  collection: string,
  find: Filter<Document>,
  options?: FindOptions<Document>
): Promise<Document[]> {
  return new Promise(async (next, reject) => {
    const col = await dbCollection(collection)
    col.find(find, options).toArray(async (error, docs) => {
      if (error) {
        await col._client.close()
        return reject(error)
      }
      await col._client.close()
      next(docs)
    })
  })
}

export function dbInsertOne(
  collection: string,
  doc: Document
): Promise<InsertOneResult<any>> {
  return new Promise(async (next, reject) => {
    const col = await dbCollection(collection)
    try {
      const res = await col.insertOne(doc)
      await col._client.close()
      next(res)
    } catch (err) {
      await col._client.close()
      return reject(err)
    }
  })
}

export function dbUpdateOne(
  colName: string,
  filter: Filter<Document>,
  update: UpdateFilter<Document>
): Promise<UpdateResult> {
  return new Promise(async (next, reject) => {
    const col = await dbCollection(colName)
    try {
      const res = await col.updateOne(filter, update)
      await col._client.close()
      next(res as UpdateResult)
    } catch (err) {
      await col._client.close()
      reject(err)
    }
  })
}

export function dbDeleteOne(
  colName: string,
  filter: Filter<Document>
): Promise<DeleteResult> {
  return new Promise(async (next, reject) => {
    const col = await dbCollection(colName)
    col.deleteOne(filter, async (err, res) => {
      if (err) {
        await col._client.close()
        return reject(err)
      }
      await col._client.close()
      next(res)
    })
  })
}

export function createFilter(query: Filter<Document>[]) {
  const filter: Record<string, any> = {}
  for (const key in query) {
    const value = query[key]
    if (!value.length) return
    filter[key] = { $in: value }
  }
  return filter
}

export function createProjection(query: string[]): Projection<Document> {
  const filter: Record<string, 0 | 1> = {}
  for (const val of query) {
    filter[val] = 1
  }
  return filter
}
