import { Layout } from './components/layout'
import type { MetaFunction } from '@remix-run/node'
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useLocation,
} from '@remix-run/react'
import type { LoaderFunction } from '@remix-run/node'

import type { LinksFunction } from '@remix-run/node'

import './tailwind.css'
import { getGitLabUser } from './services/gitlab.server'
import { getUserTokens } from './services/user.server'

export const meta: MetaFunction = () => {
  return [
    { title: 'Release Dashboard' },
    { name: 'description', content: 'Release Dashboard' },
  ]
}

export const links: LinksFunction = () => [
  { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
  {
    rel: 'preconnect',
    href: 'https://fonts.gstatic.com',
    crossOrigin: 'anonymous',
  },
  {
    rel: 'stylesheet',
    href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
  },
]

export const loader: LoaderFunction = async ({ request }) => {
  const user = await getUserTokens(request)

  if (!user) {
    return null
  }

  const gitLabUser = await getGitLabUser(user.accessToken, request)

  return {
    username: gitLabUser.username,
    avatarUrl: gitLabUser.avatar_url,
  }
}

export default function App() {
  const location = useLocation()
  const isLoginPage = location.pathname === '/login'
  const userProfileData = useLoaderData<typeof loader>()

  return (
    <html lang='en'>
      <head>
        <meta charSet='utf-8' />
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <Meta />
        <Links />
      </head>
      <body>
        {isLoginPage ? (
          <Outlet />
        ) : (
          <Layout userProfileData={userProfileData}>
            <div className='max-w-5xl mx-auto'>
              <Outlet />
            </div>
          </Layout>
        )}
        <ScrollRestoration />
        <Scripts />
        <LiveReload />
      </body>
    </html>
  )
}
