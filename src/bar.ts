import { injectable } from "tsyringe"

@injectable()
export class Bar {
  msg(msg: string) {
    console.log(`bar says ${msg}`)
  }
}
