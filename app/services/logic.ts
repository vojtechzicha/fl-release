import { environments, projects } from './config'
import {
  DeploymentInfoData,
  type DeploymentInfoVersions,
} from './gitlab.server'
import { gt, lt, gte } from 'semver'

export type EnivornmnetUpdateInfo = {
  deployFrom: { envSlug: string; version: string }[]
  pushTo: { envSlug: string; version: string }[]
}
export type EnivornmneSummarytUpdateInfo = {
  env: string
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

export function* getUpdates(data: DeploymentInfoData[]) {
  for (const env of environments) {
    if (env.type !== 'release') continue

    environment: for (const otherEnv of environments) {
      if (otherEnv.slug === env.slug || otherEnv.type !== 'release') continue

      for (const project of projects) {
        const versions = data.find(d => d.tenantId === project.projectId)
        if (!versions) continue environment

        const myVersion = versions.versions[env.slug],
          theirVersion = versions.versions[otherEnv.slug]

        if (myVersion === undefined || theirVersion === undefined)
          continue environment

        if (lt(myVersion.version, theirVersion.version)) continue environment
      }

      yield { sourceEnv: env.slug, targetEnv: otherEnv.slug }
    }
  }
}

export function getEnvironmentIconStatus(
  lastDeployment: any,
  envSlug: string,
  envType: string,
  versions: DeploymentInfoVersions
) {
  if (!lastDeployment) return null

  if (envType === 'release') {
    const updates = getUpdatesForEnvironment(versions, envSlug)
    console.log(updates)

    if (
      lastDeployment.status === 'failed' ||
      lastDeployment.status === 'canceled'
    ) {
      return 'failed'
    } else if (
      lastDeployment.status === 'created' ||
      lastDeployment.status === 'running'
    ) {
      return 'pending'
    } else if (updates.deployFrom.length > 0) {
      return 'update-waiting'
    } else {
      return 'success'
    }
  } else {
    return 'success'
  }
}

export function shouldYouUpdate(sourceVersion: string, targetVersion: string) {
  return gt(sourceVersion, targetVersion)
}
