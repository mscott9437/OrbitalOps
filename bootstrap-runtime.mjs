
import { initializeRuntime } from './semantic-runtime/loader/runtime-loader.mjs'

const runtime = await initializeRuntime({
  runtimeClass: 'orbitalops-continuity-runtime'
})

await runtime.bootstrap()
