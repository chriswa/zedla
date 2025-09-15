import 'reflect-metadata'
import { App } from '@/app/app'
import { container } from 'tsyringe'

await container.resolve(App).boot()
