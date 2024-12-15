import { LoaderFunction, redirect } from '@remix-run/node'
import { destroySession, getSessionRequest } from '~/utils/session.server'

export async function getUserTokens(request: Request) {
  const session = await getSessionRequest(request)

  const user = session.get('accessToken')

  if (!user) {
    return null
  } else {
    return { accessToken: user, refreshToken: session.get('refreshToken') }
  }
}

export const logoutSession = async (request: Request) => {
  const session = await getSessionRequest(request)

  return redirect('/login', {
    headers: {
      'Set-Cookie': (await destroySession(session)) || '',
    },
  })
}
