import { version } from 'react'
import { environments, projects } from './config'
import { logoutSession } from './user.server'
import { parseISO } from 'date-fns'

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
  status: 'success' | 'pending' | 'update-waiting'
  type: 'ci' | 'test' | 'release'
}
export type DeploymentInfoData = {
  tenant: string
  versions: { [key: string]: VersionInfo }
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
      let versions: { [key: string]: VersionInfo } = {}

      for (let env of environments) {
        const envSummary = environmentDetails.find(
          (e: any) => e.slug === env.slug
        )
        if (envSummary === undefined) continue

        if (env.type === 'release') {
          const envDetail = await gitlabFetch(
            accessToken,
            request,
            `api/v4/projects/${project.projectId}/environments/${envSummary.id}`
          ).then(res => res.json())

          console.log(envDetail.last_deployment.deployable)

          if (envDetail.last_deployment) {
            versions[env.slug] = {
              version: envDetail.last_deployment.ref,
              timestamp: parseISO(
                envDetail.last_deployment.deployable.started_at
              ),
              status: 'success',
              type: env.type,
            } as const
          }
        }
      }

      return {
        tenant: project.name,
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
