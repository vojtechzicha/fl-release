export type EnvironmentConfigInfo = {
  name: string
  order: number
  slug: string
  type: 'ci' | 'test' | 'release'
}

export const environments: EnvironmentConfigInfo[] = [
  {
    name: 'Development',
    order: 10,
    slug: 'dev',
    type: 'ci',
  },
  {
    name: 'Test',
    order: 20,
    slug: 'test',
    type: 'test',
  },
  {
    name: 'UAT',
    order: 30,
    slug: 'uat',
    type: 'release',
  },
  {
    name: 'Demo',
    order: 35,
    slug: 'demo',
    type: 'release',
  },
  {
    name: 'Production',
    order: 40,
    slug: 'prod',
    type: 'release',
  },
]

export const projects = [
  {
    name: 'PDF Generator',
    order: 50,
    projectId: '1688',
  },
  {
    name: 'Web App',
    order: 10,
    projectId: '1688',
  },
  {
    name: 'Backend',
    order: 40,
    projectId: '1688',
  },
  {
    name: 'Integration Layer',
    order: 20,
    projectId: '1688',
  },
]
