let cached: boolean | null = null

export function getSetupCache(): boolean | null {
  return cached
}

export function setSetupCache(value: boolean): void {
  cached = value
}

export function invalidateSetupCache(): void {
  cached = null
}
