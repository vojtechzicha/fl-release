import { json, type LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import {
  CheckCircle,
  ClipboardList,
  MoreHorizontal,
  RefreshCw,
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

interface DeploymentData {
  tenant: string
  versions: {
    development?: VersionInfo
    test?: VersionInfo
    production?: VersionInfo
  }
}

interface VersionInfo {
  version: string
  timestamp: string
  status: 'success' | 'pending' | 'update-waiting'
}

// Loader function to fetch deployment data
export const loader: LoaderFunction = async () => {
  // Replace this with your actual data fetching logic
  const deployments = [
    {
      tenant: 'Untenanted',
      versions: {
        development: {
          version: '3.6.0',
          timestamp: 'Oct 16, 9:16AM',
          status: 'success' as const,
        },
        test: {
          version: '3.5.9',
          timestamp: 'Oct 15, 8:16PM',
          status: 'update-waiting' as const,
        },
        production: {
          version: '3.5.8',
          timestamp: 'Oct 14, 12:16AM',
          status: 'success' as const,
        },
      },
    },
    {
      tenant: 'Companion Vets',
      versions: {
        test: {
          version: '3.5.9',
          timestamp: 'Oct 16, 1:11AM',
          status: 'success' as const,
        },
        production: {
          version: '3.5.8',
          timestamp: 'Oct 15, 12:21AM',
          status: 'pending' as const,
        },
      },
    },
    // Add other deployments...
  ]

  return json({ deployments })
}

export default function DeploymentsRoute() {
  const { deployments } = useLoaderData<typeof loader>()

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
                <TableHead className='w-[200px]'>Tenant</TableHead>
                <TableHead>Development</TableHead>
                <TableHead>Test</TableHead>
                <TableHead>Production</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deployments.map((deployment: DeploymentData) => (
                <TableRow key={deployment.tenant}>
                  <TableCell className='font-medium'>
                    <div className='flex items-center gap-2'>
                      <PawIcon className='text-slate-400' />
                      <span>{deployment.tenant}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <VersionCell info={deployment.versions.development} />
                  </TableCell>
                  <TableCell>
                    <VersionCell
                      info={deployment.versions.test}
                      environment='test'
                    />
                  </TableCell>
                  <TableCell>
                    <VersionCell info={deployment.versions.production} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Legend />
        </CardContent>
      </Card>
    </div>
  )
}

const VersionCell = ({
  info,
  environment,
}: {
  info?: VersionInfo
  environment?: string
}) => {
  const [showChangelog, setShowChangelog] = useState(false)

  if (!info) return null

  return (
    <div className='flex items-center gap-2'>
      {info.status === 'success' ? (
        <CheckCircle className='w-5 h-5 text-green-500' />
      ) : info.status === 'update-waiting' ? (
        <RefreshCw className='w-5 h-5 text-yellow-500' />
      ) : (
        <LoadingDots />
      )}
      <div className='flex flex-col'>
        <div className='flex items-center gap-1'>
          <span className='text-sm font-medium'>{info.version}</span>
          <Button
            variant='ghost'
            size='sm'
            className='h-6 w-6 p-0 text-muted-foreground hover:text-foreground'
            onClick={() => setShowChangelog(true)}
          >
            <ClipboardList className='h-3.5 w-3.5' />
            <span className='sr-only'>View changelog</span>
          </Button>
        </div>
        <span className='text-xs text-muted-foreground'>{info.timestamp}</span>
      </div>
      {environment === 'test' && info.status === 'update-waiting' && (
        <UpdateMenu />
      )}
      <ChangelogModal
        version={info.version}
        open={showChangelog}
        onOpenChange={setShowChangelog}
      />
    </div>
  )
}

const UpdateMenu = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
          <MoreHorizontal className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuItem disabled>Create release</DropdownMenuItem>
        <DropdownMenuItem>Deploy from `dev`</DropdownMenuItem>
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
          <ClipboardList className='w-3.5 h-3.5 opacity-50' />
          <span>View changelog</span>
        </div>
      </div>
    </div>
  )
}
