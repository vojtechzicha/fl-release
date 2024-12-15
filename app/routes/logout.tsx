import { LoaderFunction, redirect } from '@remix-run/node'
import { destroySession, getSessionRequest } from '~/utils/session.server'

export const loader: LoaderFunction = async ({
  request,
}: {
  request: Request
}) => {
  const session = await getSessionRequest(request)

  return redirect('/login', {
    headers: {
      'Set-Cookie': (await destroySession(session)) || '',
    },
  })
}
