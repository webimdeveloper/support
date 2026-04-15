import { requireClientScope } from '../../../utils/auth'
import { resolveClientBySlug } from '../../../utils/client-resolver'
import { deriveClientServiceStatuses } from '../../../utils/client-services'
import { buildServiceManifest } from '../../../services/modules/executor'
import { ok } from '../../../utils/api-envelope'

export default defineEventHandler(async (event) => {
  const { client } = getRouterParams(event)
  const clientSlug = String(client || '')
  await requireClientScope(event, clientSlug)

  const clientRow = await resolveClientBySlug(event, clientSlug)
  if (!clientRow) {
    throw createError({ statusCode: 404, statusMessage: 'Client not found' })
  }

  const modules = await buildServiceManifest({
    clientSlug,
    serviceStatuses: deriveClientServiceStatuses(clientRow as any),
  })

  return ok({ modules })
})
