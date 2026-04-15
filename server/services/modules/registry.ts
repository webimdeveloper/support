import type { ServiceModuleProvider } from './types'
import { croModuleProvider } from './providers/cro'
import { siteHealthModuleProvider } from './providers/site-health'

export const serviceModuleRegistry: ServiceModuleProvider[] = [
  croModuleProvider,
  siteHealthModuleProvider,
]
