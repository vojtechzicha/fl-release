import { environments } from './config'
import { type DeploymentInfoVersions } from './gitlab.server'
import { gt, lt } from 'semver'

export type EnivornmnetUpdateInfo = {
  deployFrom: { envSlug: string; version: string }[]
  pushTo: { envSlug: string; version: string }[]
}

export function getUpdatesForEnvironment(
  versions: DeploymentInfoVersions,
  envSlug: string
) {
  let updates: EnivornmnetUpdateInfo = { deployFrom: [], pushTo: [] }
  const env = environments.find(e => e.slug === envSlug)
  if (!versions[envSlug] || !env || env.type !== 'release') return updates

  for (const env of environments) {
    if (env.slug === envSlug || env.type !== 'release' || !versions[env.slug])
      continue

    if (gt(versions[env.slug].version, versions[envSlug].version)) {
      updates.deployFrom.push({
        envSlug: env.slug,
        version: versions[env.slug].version,
      })
    }
    if (lt(versions[env.slug].version, versions[envSlug].version)) {
      updates.pushTo.push({
        envSlug: env.slug,
        version: versions[envSlug].version,
      })
    }
  }

  return updates
}
