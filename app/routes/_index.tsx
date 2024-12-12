import type { MetaFunction } from '@remix-run/node'

import { Button } from '~/components/ui/button'

export const meta: MetaFunction = () => {
  return [
    { title: 'New Remix App' },
    { name: 'description', content: 'Welcome to Remix!' },
  ]
}

export default function Index() {
  return (
    <div>
      <Button>Click me</Button>
    </div>
  )
}

const deployments = {
  tenants: [
    {
      name: 'Untenanted',
      versions: {
        development: {
          version: '3.6.0',
          timestamp: 'Oct 16, 9:16AM',
          status: 'success',
        },
        test: {
          version: '3.5.9',
          timestamp: 'Oct 15, 8:16PM',
          status: 'success',
        },
        production: {
          version: '3.5.8',
          timestamp: 'Oct 14, 12:16AM',
          status: 'success',
        },
      },
    },
    {
      name: 'Companion Vets',
      versions: {
        test: {
          version: '3.5.9',
          timestamp: 'Oct 16, 1:11AM',
          status: 'success',
        },
        production: {
          version: '3.5.8',
          timestamp: 'Oct 15, 12:21AM',
          status: 'pending',
        },
      },
    },
    {
      name: 'Veterinary',
      versions: {
        production: {
          version: '3.5.8',
          timestamp: 'Oct 15, 12:21AM',
          status: 'pending',
        },
      },
    },
    {
      name: 'Pet Health',
      versions: {
        production: {
          version: '3.5.8',
          timestamp: 'Oct 15, 12:21AM',
          status: 'pending',
        },
      },
    },
    {
      name: 'Valley Vet Clinic',
      versions: {
        production: {
          version: '3.5.6',
          timestamp: 'Oct 15, 12:21AM',
          status: 'pending',
        },
      },
    },
    {
      name: 'Cat Care Palace',
      versions: {
        production: {
          version: '3.5.8',
          timestamp: 'Oct 15, 12:21AM',
          status: 'pending',
        },
      },
    },
  ],
}
