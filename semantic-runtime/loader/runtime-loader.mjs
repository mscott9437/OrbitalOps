
export async function initializeRuntime(config) {
  return {
    async bootstrap() {
      console.log('Initializing runtime...')
      console.log(config)
    }
  }
}
