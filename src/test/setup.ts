// Import reflect-metadata for tsyringe decorators
import 'reflect-metadata'
import { BrowserFrameScheduler } from '@/app/browserFrameScheduler'
// Import real classes and test doubles
import { Input } from '@/app/input'
import { RenderSystem } from '@/game/ecs/systems/renderSystem'
import { Canvas } from '@/gfx/canvas'
import { ImageLoader } from '@/gfx/imageLoader'
import { TestCanvas } from '@/test/doubles/testCanvas'
import { TestImageLoader } from '@/test/doubles/testImageLoader'
import { TestInput } from '@/test/doubles/testInput'
import { TestRenderSystem } from '@/test/doubles/testRenderSystem'
import { TestSingleFrameScheduler } from '@/test/doubles/testSingleFrameScheduler'
import { container } from 'tsyringe'

// Register test doubles to replace browser-dependent classes
// Use useToken to resolve the singleton instance of test doubles
container.register(Input, { useToken: TestInput })
container.register(Canvas, { useToken: TestCanvas })
container.register(ImageLoader, { useToken: TestImageLoader })
container.register(BrowserFrameScheduler, { useToken: TestSingleFrameScheduler })
container.register(RenderSystem, { useToken: TestRenderSystem })
