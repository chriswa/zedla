import 'reflect-metadata'

// other imports in this file must follow after `import 'reflect-metadata'`
import { container } from 'tsyringe'
import { App } from '@/app/app'

await container.resolve(App).start()
