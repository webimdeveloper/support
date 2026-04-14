import { describe, expect, it } from 'vitest'
import { getProjectSlugFromUrl } from '../../server/utils/project'

describe('getProjectSlugFromUrl', () => {
  it('builds slug from hostname', () => {
    expect(getProjectSlugFromUrl('https://www.example-site.com/path')).toBe('example-site-com')
  })

  it('falls back to raw value for invalid urls', () => {
    expect(getProjectSlugFromUrl('client.domain.tld/some-page')).toBe('client-domain-tld')
  })
})
