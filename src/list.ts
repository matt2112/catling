import { Option } from './option'
import { Monoid } from './monoid'

export interface List<T> extends Monoid<List<T>> {
  toArray: () => T[]
  toString: () => string
  inspect: () => string
  map: <K>(fn: (item: T) => K) => List<K>
  filter: (fn: (el: T) => boolean) => List<T>
  length: () => number
  flatMap: <K>(fn: (item: T) => List<K>) => List<K>
  chain: <K>(fn: (item: T) => List<K>) => List<K>
  fold: <K>(initial: K) => (fn: (acc: K, el: T) => K) => K
  head: () => T | undefined
  headOption: () => Option<T>
  tail: () => List<T>
  find: (p: (item: T) => boolean) => Option<T>
  contains: (p: (item: T) => boolean) => boolean
}

export interface ListFactory {
  <T>(...items: T[]): List<T>
  fromArray: <T>(items: T[]) => List<T>
}

const ListFactory = (<T>(...items: T[]): List<T> => {
  const inspect = () => `List(${items})`
  const flatMap = <K>(fn) =>
    ListFactory(...items).fold(ListFactory<K>())((acc, i) => acc.concat(fn(i)))

  return {
    toArray: () => items,
    toString: inspect,
    inspect,
    map: fn => ListFactory(...items.map(fn)),
    filter: fn => ListFactory(...items.filter(fn)),
    length: () => items.length,
    concat: list2 => ListFactory(...items, ...list2.toArray()),
    flatMap,
    chain: flatMap,
    fold: initial => fn => items.reduce(fn, initial),
    head: () => items[0],
    headOption: () => Option(items[0]),
    tail: () => ListFactory(...items.slice(1)),
    empty: () => ListFactory(),
    find: p => Option(items.reduce((acc, curr) => (acc ? acc : p(curr) ? curr : acc), undefined)),
    contains: p => items.reduce((acc, curr) => (acc ? acc : p(curr)), false),
  }
}) as ListFactory

ListFactory.fromArray = <T>(items: T[]) => ListFactory(...items)

export const List = ListFactory
