export type Brand<T, B> = T & { __brand: B }

export type LayeredBrand<T, Tags extends string[]> =
  T & { [K in Tags[number] as `__brand__${K}`]: true }
