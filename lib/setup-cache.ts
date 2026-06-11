let cachedResult: boolean | null = null

export function getSetupCache(): boolean | null {
  return cachedResult
}

export function setSetupCache(needsSetup: boolean): void {
  if (!needsSetup) {
    cachedResult = false
  }
}

export function invalidateSetupCache(): void {
  cachedResult = null
}
