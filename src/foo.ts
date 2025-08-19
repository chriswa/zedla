import { injectable } from 'tsyringe'
import { Bar } from './bar'

@injectable()
export class Foo {
  constructor(private bar: Bar) {}
  hello() {
    this.bar.msg('Hello from foo')
  }
}
