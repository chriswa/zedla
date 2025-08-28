export type TakeFirst<N extends number, T extends any[], I extends any[] = []> =
  I['length'] extends N
    ? I
    : T extends [infer Head, ...infer Tail]
      ? TakeFirst<N, Tail, [...I, Head]>
      : I
