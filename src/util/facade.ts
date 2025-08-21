type FacadeMethodKeys<T> = {
  [K in keyof T]: K extends `_${string}` ? never :
    T[K] extends Function ? K : never
}[keyof T]

type FacadeMethods<T> = Pick<T, FacadeMethodKeys<T>>

export type Facade<C extends new (...args: any) => any> =
  new (...args: ConstructorParameters<C>) => FacadeMethods<InstanceType<C>>

  export function facadeOf<C extends new (...args: any) => any>(
  ctor: C
): Facade<C> {
  return ctor as Facade<C>
}
