export const ok = <T>(data: T) => ({
  success: true as const,
  data,
  error: null,
})

export const fail = (code: string, message: string, statusCode = 400) => {
  throw createError({
    statusCode,
    statusMessage: JSON.stringify({
      success: false,
      data: null,
      error: { code, message },
    }),
  })
}
