import { type LoaderFunction, redirect } from '@remix-run/node'
import { authenticator } from '~/services/auth.server'
import { commitSession, getSession } from '~/utils/session.server'

export const loader: LoaderFunction = async ({ request }) => {
  const user = await authenticator.authenticate('gitlab', request)

  const session = await getSession(request.headers.get('Cookie'))
  session.set('accessToken', user.accessToken)
  session.set('refreshToken', user.refreshToken)

  if (user) {
    return redirect('/', {
      headers: {
        'Set-Cookie': (await commitSession(session)) || '',
      },
    })
  } else {
    return redirect('/login')
  }
}
