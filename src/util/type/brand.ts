export type Brand<T, B> = T & { __brand: B }

export type LayeredBrand<T, Tags extends Array<string>> =
  T & { [K in Tags[number] as `__brand__${K}`]: true }
