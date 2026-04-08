export const getProjectSlugFromUrl = (siteUrl: string) => {
  try {
    const hostname = new URL(siteUrl).hostname.replace(/^www\./, '')
    return hostname.replace(/\./g, '-')
  } catch {
    return siteUrl
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/^www\./, '')
      .split('/')[0]
      .replace(/\./g, '-')
  }
}
