export type SkipFirst<N extends number, T extends any[], I extends any[] = []> =
  I['length'] extends N
    ? T
    : T extends [any, ...infer R]
      ? SkipFirst<N, R, [...I, any]>
      : []
