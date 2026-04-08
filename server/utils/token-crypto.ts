import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto'

const algo = 'aes-256-gcm'

const getKey = (event: any) => {
  const config = useRuntimeConfig(event)
  const secret = String(config.googleTokenEncryptionKey || config.session?.password || '')
  if (!secret) {
    throw createError({ statusCode: 500, statusMessage: 'Token encryption key is not configured' })
  }
  return createHash('sha256').update(secret).digest()
}

export const encryptToken = (event: any, plain: string) => {
  const key = getKey(event)
  const iv = randomBytes(12)
  const cipher = createCipheriv(algo, key, iv)
  const encrypted = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
  const tag = cipher.getAuthTag()
  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

export const decryptToken = (event: any, token: string) => {
  const key = getKey(event)
  const payload = Buffer.from(token, 'base64')
  const iv = payload.subarray(0, 12)
  const tag = payload.subarray(12, 28)
  const encrypted = payload.subarray(28)
  const decipher = createDecipheriv(algo, key, iv)
  decipher.setAuthTag(tag)
  const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()])
  return decrypted.toString('utf8')
}
