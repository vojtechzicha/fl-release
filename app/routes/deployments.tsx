// app/routes/deployments.tsx
import { json, type LoaderFunction } from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { CheckCircle } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '~/components/ui/table'
import { Card } from '~/components/ui/card'

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
  status: 'success' | 'pending'
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
          status: 'success' as const,
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
    <div className='container mx-auto py-6'>
      <Card>
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
                  <VersionCell info={deployment.versions.test} />
                </TableCell>
                <TableCell>
                  <VersionCell info={deployment.versions.production} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}

const VersionCell = ({ info }: { info?: VersionInfo }) => {
  if (!info) return null

  return (
    <div className='flex items-center gap-2'>
      {info.status === 'success' ? (
        <CheckCircle className='w-5 h-5 text-green-500' />
      ) : (
        <LoadingDots />
      )}
      <div className='flex flex-col'>
        <span className='text-sm font-medium'>{info.version}</span>
        <span className='text-xs text-muted-foreground'>{info.timestamp}</span>
      </div>
    </div>
  )
}

const LoadingDots = () => (
  <div className='flex gap-1'>
    <div className='w-2 h-2 rounded-full bg-blue-500 animate-pulse' />
    <div className='w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-100' />
    <div className='w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-200' />
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
