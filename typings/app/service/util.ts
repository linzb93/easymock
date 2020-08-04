export interface AnyObject {
  [name: string]: any
}

interface SelectQuery {
  where: AnyObject,
  limit?: number,
  offset?: number,
  columns?: string[],
  order?: string[][]
}
export interface MysqlType {
  get(tableName: string, query: object):Promise<any>,
  select(tableName: string, query: SelectQuery):Promise<any>,
  insert(tableName: string, data: object):Promise<any>,
  update(tableName: string, data: object, options: {where: object}):Promise<any>,
  delete(tableName: string, data: object):Promise<any>,
  query(sentence: string, args?: any[]):Promise<any>
}

