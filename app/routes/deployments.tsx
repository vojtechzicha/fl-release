import {
  ActionFunction,
  json,
  redirect,
  type LoaderFunction,
} from '@remix-run/node'
import {
  Form,
  Link,
  Outlet,
  useActionData,
  useLoaderData,
  useNavigation,
} from '@remix-run/react'
import {
  CheckCircle,
  ClipboardList,
  MoreHorizontal,
  RefreshCw,
  Loader,
  Loader2,
  XCircle,
  RefreshCcw,
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { useState } from 'react'
import { ChangelogModal } from '~/components/changelog-modal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'
import { getUserTokens } from '~/services/user.server'
import {
  deployEnvironment,
  DeploymentInfoData,
  DeploymentInfoVersions,
  deployRelease,
  getDeploymentInfo,
  getGitLabUser,
  VersionInfo,
} from '~/services/gitlab.server'
import { environments } from '~/services/config'
import { formatDistanceToNow, format } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '~/components/ui/tooltip'
import {
  EnivornmnetUpdateInfo,
  getUpdates,
  getUpdatesForEnvironment,
} from '~/services/logic'
import { toast } from 'sonner'
import { useRevalidateOnFocus, useRevalidateOnInterval } from '~/utils/hooks'

// Loader function to fetch deployment data
export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserTokens(request)
  if (!user) throw redirect('/login')

  console.log({ accessToken: user.accessToken })

  // Replace this with your actual data fetching logic
  const deployments = await getDeploymentInfo(user.accessToken, request)

  return { deployments }
}

export const action: ActionFunction = async ({ request }) => {
  const user = await getUserTokens(request)
  if (!user) throw redirect('/login')

  const formData = await request.clone().formData()
  const formType = formData.get('formType')

  if (formType === 'deploy-release') {
    const targetEnvironment = formData.get('targetEnvironment') as string
    const releaseName = formData.get('releaseName') as string
    const tenantId = formData.get('tenantId') as string

    await deployRelease(
      user.accessToken,
      request,
      tenantId,
      targetEnvironment,
      releaseName
    )

    toast.success('Deployment initiated')
  } else if (formType === 'deploy-environment-release') {
    const targetEnvironment = formData.get('targetEnvironment') as string
    const sourceEnvironment = formData.get('sourceEnvironment') as string

    await deployEnvironment(
      user.accessToken,
      request,
      sourceEnvironment,
      targetEnvironment
    )

    toast.success(
      `Pushing from ${sourceEnvironment} to ${targetEnvironment} initiated`
    )
  } else {
    return new Promise(resolve => {
      setTimeout(() => {
        resolve(redirect('/deployments'))
      }, 5000)
    })
  }
}

export default function DeploymentsRoute() {
  const { deployments } = useLoaderData<typeof loader>()

  useRevalidateOnInterval({ enabled: true, interval: 10000 })
  useRevalidateOnFocus({ enabled: true })

  const allUpdates = [...getUpdates(deployments)]

  return (
    <div className='space-y-6 max-w-5xl mx-auto'>
      <div>
        <h1 className='text-3xl font-bold tracking-tight'>Deployments</h1>
        <p className='text-muted-foreground mt-2'>
          Monitor and manage deployment statuses across different environments.
        </p>
      </div>

      <Card>
        <CardContent className='pt-6'>
          <Table>
            <TableHeader>
              <TableRow className='hover:bg-transparent'>
                <TableHead className='w-[200px]'>Component</TableHead>
                {environments.map(env => (
                  <TableHead key={env.slug}>
                    {env.name}{' '}
                    {allUpdates
                      .filter(u => u.sourceEnv === env.slug)
                      .map(update => (
                        <UpdateAllMenu
                          sourceEnv={update.sourceEnv}
                          targetEnv={update.targetEnv}
                        />
                      ))}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment: DeploymentInfoData) => (
                <TableRow key={deployment.tenant}>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-2'>
                      <PawIcon className='text-slate-400' />
                      <span>{deployment.tenant}</span>
                    </div>
                  </TableCell>

                  {environments.map(env => {
                    if (deployment.versions[env.slug]) {
                      const version = deployment.versions[env.slug]
                      return (
                        <TableCell key={env.slug}>
                          <VersionCell
                            info={version}
                            environment={env.slug}
                            tenantId={deployment.tenantId}
                            versions={deployment.versions}
                          />
                        </TableCell>
                      )
                    } else {
                      return <TableCell key={env.slug} />
                    }
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Outlet />
          <Legend />
        </CardContent>
      </Card>
    </div>
  )
}

const VersionCell = ({
  info,
  versions,
  tenantId,
  environment,
}: {
  info?: VersionInfo
  versions: DeploymentInfoVersions
  tenantId: string
  environment: string
}) => {
  if (!info) return null
  const navigation = useNavigation()
  const updates = getUpdatesForEnvironment(versions, environment)

  return (
    <div className='flex items-center gap-2'>
      {navigation.state === 'submitting' ? (
        <Loader2 className='w-5 h-5 text-blue-500/70 animate-spin' />
      ) : info.status === 'success' ? (
        <CheckCircle className='w-5 h-5 text-green-500' />
      ) : info.status === 'update-waiting' ? (
        <RefreshCw className='w-5 h-5 text-yellow-500' />
      ) : (
        <LoadingDots />
      )}
      <div className='flex flex-col'>
        <div className='flex items-center gap-1'>
          <span className='text-sm font-medium'>{info.version}</span>
          {info.type === 'release' && (
            <Button
              asChild
              variant='ghost'
              size='sm'
              className='h-6 w-6 p-0 text-muted-foreground hover:text-foreground'
            >
              <Link to={`changelog/${info.version}`}>
                {navigation.state === 'loading' &&
                navigation.location.pathname.endsWith(info.version) ? (
                  <Loader className='h-3.5 w-3.5' />
                ) : (
                  <ClipboardList className='h-3.5 w-3.5' />
                )}
                <span className='sr-only'>View changelog</span>
              </Link>
            </Button>
          )}
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger>
              <span className='text-xs text-muted-foreground'>
                {formatDistanceToNow(info.timestamp, {
                  addSuffix: true,
                  includeSeconds: true,
                })}
              </span>
            </TooltipTrigger>
            <TooltipContent>
              {format(info.timestamp, 'd. M. yyyy HH:mm:ss')}
              <br />
              took 5 seconds
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      {(updates.deployFrom.length > 0 || updates.pushTo.length > 0) && (
        <UpdateMenu
          updates={updates}
          tenantId={tenantId}
          envSlug={environment}
        />
      )}
    </div>
  )
}

const UpdateMenu = ({
  updates: { deployFrom, pushTo },
  tenantId,
  envSlug,
}: {
  updates: EnivornmnetUpdateInfo
  tenantId: string
  envSlug: string
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        {deployFrom.map(update => (
          <DropdownMenuItem asChild>
            <Form method='post'>
              <input type='hidden' name='formType' value='deploy-release' />
              <input type='hidden' name='projectId' value={tenantId} />
              <input type='hidden' name='targetEnvironment' value={envSlug} />
              <input type='hidden' name='releaseName' value={update.version} />
              <Button variant='secondary' type='submit'>
                Deploy <code>{update.version}</code> from{' '}
                <code>{update.envSlug}</code>
              </Button>
            </Form>
          </DropdownMenuItem>
        ))}
        {pushTo.map(update => (
          <DropdownMenuItem asChild>
            <Form method='post'>
              <input type='hidden' name='formType' value='deploy-release' />
              <input type='hidden' name='projectId' value={tenantId} />
              <input
                type='hidden'
                name='targetEnvironment'
                value={update.envSlug}
              />
              <input type='hidden' name='releaseName' value={update.version} />
              <Button variant='secondary' type='submit'>
                Push <code>{update.version}</code> to{' '}
                <code>{update.envSlug}</code>
              </Button>
            </Form>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const UpdateAllMenu = ({
  sourceEnv,
  targetEnv,
}: {
  sourceEnv: string
  targetEnv: string
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem asChild>
          <Form method='post'>
            <input
              type='hidden'
              name='formType'
              value='deploy-environment-release'
            />
            <input type='hidden' name='targetEnvironment' value={targetEnv} />
            <input type='hidden' name='sourceEnvironment' value={sourceEnv} />
            <Button variant='secondary' type='submit'>
              Push to <code>{targetEnv}</code>
            </Button>
          </Form>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const LoadingDots = ({ small }: { small?: boolean }) => (
  <div className='flex gap-0.5'>
    <div
      className={`${
        small ? 'w-1.5 h-1.5' : 'w-2 h-2'
      } rounded-full bg-blue-500/70 animate-pulse`}
    />
    <div
      className={`${
        small ? 'w-1.5 h-1.5' : 'w-2 h-2'
      } rounded-full bg-blue-500/70 animate-pulse delay-100`}
    />
    <div
      className={`${
        small ? 'w-1.5 h-1.5' : 'w-2 h-2'
      } rounded-full bg-blue-500/70 animate-pulse delay-200`}
    />
  </div>
)

const PawIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='currentColor'
  >
    <path d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z' />
  </svg>
)

const Legend = () => {
  return (
    <div className='border-t border-border mt-6 pt-4'>
      <div className='flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground px-2'>
        <div className='flex items-center gap-1.5'>
          <CheckCircle className='w-3.5 h-3.5 text-green-500/70' />
          <span>Deployment successful</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <RefreshCw className='w-3.5 h-3.5 text-yellow-500/70' />
          <span>Update available</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <LoadingDots small />
          <span>Deployment in progress</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <XCircle className='w-3.5 h-3.5 text-red-500/70' />
          <span>Deployment failed</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <Loader2 className='w-3.5 h-3.5 text-blue-500/70 animate-spin' />
          <span>Data Loading from Server</span>
        </div>
        <div className='flex items-center gap-1.5'>
          <ClipboardList className='w-3.5 h-3.5 opacity-50' />
          <span>View changelog</span>
        </div>
      </div>
      <div className='mt-2 flex items-center gap-1.5 text-xs text-muted-foreground px-2'>
        <RefreshCcw className='w-3.5 h-3.5 text-blue-500/70' />
        <span>Dashboard auto-updates every 10s</span>
      </div>
    </div>
  )
}
