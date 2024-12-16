import { version } from 'react'
import { environments, projects } from './config'
import { logoutSession } from './user.server'
import { parseISO } from 'date-fns'
import { getEnvironmentIconStatus, shouldYouUpdate } from './logic'

interface GitLabUser {
  username: string
  name: string
  avatar_url: string
}

export async function getGitLabUser(
  accessToken: string,
  request: Request
): Promise<GitLabUser> {
  const response = await gitlabFetch(accessToken, request, 'api/v4/user')

  if (!response.ok) {
    throw new Error('Failed to fetch GitLab user data')
  }

  const userData: GitLabUser = await response.json()
  return userData
}

export type VersionInfo = {
  version: string
  timestamp: Date
  status: 'success' | 'pending' | 'update-waiting' | 'failed'
  type: 'ci' | 'test' | 'release'
}
export type DeploymentInfoVersions = { [key: string]: VersionInfo }
type DeploymentInfoVersionsWithDeployment = {
  [key: string]: VersionInfo & { lastDeployment: any }
}
export type DeploymentInfoData = {
  tenant: string
  tenantId: string
  versions: DeploymentInfoVersions
}

export type ReleaseChangelog = {
  projectName: string
  description: string
  releaseUrl: string
  closedMergeRequestsUrl: string
  editUrl: string
  openedMergeRequestsUrl: string
}
export async function getReleaseChangelog(
  accessToken: string,
  request: Request,
  tagName: string
) {
  return (
    await Promise.all(
      projects.map(async project => {
        const releaseDetailsRes = await gitlabFetch(
          accessToken,
          request,
          `api/v4/projects/${project.projectId}/releases/${tagName}`
        )

        if (!releaseDetailsRes.ok) {
          return null
        }

        const releaseDetails = await releaseDetailsRes.json()

        return {
          projectName: project.name,
          description: releaseDetails.description,
          releaseUrl: releaseDetails._links.self,
          closedMergeRequestsUrl:
            releaseDetails._links.closed_merge_requests_url,
          editUrl: releaseDetails._links.edit_url,
          openedMergeRequestsUrl:
            releaseDetails._links.opened_merge_requests_url,
        }
      })
    )
  ).filter(rn => rn !== null)
}

export async function getDeploymentInfo(
  accessToken: string,
  request: Request
): Promise<DeploymentInfoData[]> {
  return Promise.all(
    projects.map(async project => {
      const environmentDetails = await gitlabFetch(
        accessToken,
        request,
        `api/v4/projects/${project.projectId}/environments`
      ).then(res => res.json())
      let versions: DeploymentInfoVersionsWithDeployment = {}

      for (let env of environments) {
        const envSummary = environmentDetails.find(
          (e: any) => e.slug === env.slug
        )
        if (envSummary === undefined) continue

        const envDetail = await gitlabFetch(
          accessToken,
          request,
          `api/v4/projects/${project.projectId}/environments/${envSummary.id}`
        ).then(res => res.json())

        if (env.type === 'release') {
          if (envDetail.last_deployment) {
            versions[env.slug] = {
              version: envDetail.last_deployment.ref,
              timestamp: parseISO(
                envDetail.last_deployment.deployable.started_at
              ),
              status: 'failed',
              type: env.type,
              lastDeployment: envDetail.last_deployment,
            } as const
          }
        } else {
          if (envDetail.last_deployment) {
            versions[env.slug] = {
              version: envDetail.last_deployment.sha.slice(0, 7),
              timestamp: parseISO(
                envDetail.last_deployment.deployable.started_at
              ),
              status: 'failed',
              type: env.type,
              lastDeployment: envDetail.last_deployment,
            } as const
          }
        }
      }

      for (let versionKey of Object.keys(versions)) {
        versions[versionKey].status =
          getEnvironmentIconStatus(
            versions[versionKey].lastDeployment,
            versionKey,
            versions[versionKey].type,
            versions
          ) ?? 'failed'
      }

      return {
        tenant: project.name,
        tenantId: project.projectId,
        versions,
      }
    })
  )
}

export async function gitlabFetch(
  accessToken: string,
  request: Request,
  url: string,
  options: RequestInit = {}
) {
  if (options.headers === undefined) {
    options.headers = { Authorization: `Bearer ${accessToken}` }
  } else {
    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${accessToken}`,
    }
  }
  const res = await fetch(`${process.env.GITLAB_ROOT_URL}${url}`, options)

  // Process the unauthorized response
  if (res.status === 401) {
    // Refresh the token  (if refresh token is available)
    // if (refreshToken) {
    //   const newTokens = await refreshGitLabToken(accessToken, refreshToken)
    //   return gitlabFetch(
    //     newTokens.accessToken,
    //     newTokens.refreshToken,
    //     url,
    //     options
    //   )
    // } else {
    throw await logoutSession(request)
    // }
  }
  return res
}

export async function deployRelease(
  accessToken: string,
  request: Request,
  projectId: string,
  envSlug: string,
  version: string
) {
  console.log('Deploying release', projectId, envSlug, version)

  // First get the pipeline with correct ref
  const pipelines = await gitlabFetch(
      accessToken,
      request,
      `api/v4/projects/${projectId}/pipelines`
    ).then(res => res.json()),
    pipeline = pipelines.find((p: any) => p.ref === version)

  if (!pipeline) throw new Error('Unknown pipeline')

  const jobName = `deploy_${envSlug}`,
    pipelineJobs = await gitlabFetch(
      accessToken,
      request,
      `api/v4/projects/${projectId}/pipelines/${pipeline.id}/jobs`
    ).then(res => res.json()),
    job = pipelineJobs.find((j: any) => j.name === jobName)

  if (!job) throw new Error('Unknown job')
  const result = await gitlabFetch(
    accessToken,
    request,
    `api/v4/projects/${projectId}/jobs/${job.id}/play`,
    { method: 'POST' }
  )

  console.log(result)

  return true
}

export async function deployEnvironment(
  accessToken: string,
  request: Request,
  sourceEnvironment: string,
  targetEnvironment: string
) {
  const deployments = await getDeploymentInfo(accessToken, request)

  for (const project of projects) {
    const info = deployments.find(d => d.tenantId === project.projectId)

    if (
      !info ||
      !info.versions[sourceEnvironment] ||
      !info.versions[targetEnvironment]
    )
      continue

    const sourceVersion = info.versions[sourceEnvironment].version,
      targetVersion = info.versions[targetEnvironment].version

    if (shouldYouUpdate(sourceVersion, targetVersion)) {
      await deployRelease(
        accessToken,
        request,
        project.projectId,
        targetEnvironment,
        sourceVersion
      )
    }

    await deployRelease(
      accessToken,
      request,
      project.projectId,
      targetEnvironment,
      sourceEnvironment
    )
  }
}
