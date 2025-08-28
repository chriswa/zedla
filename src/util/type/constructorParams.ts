export type ConstructorParams<T> =
  T extends new (...args: any) => any
    ? ConstructorParameters<T>
    : T extends { new (...args: any): any }
      ? ConstructorParameters<T>
      : never
