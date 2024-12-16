import { Logo } from '~/components/logo'
import { Button } from '~/components/ui/button'
import { Card, CardContent, CardHeader } from '~/components/ui/card'
import { Form, useActionData } from '@remix-run/react'
import {
  json,
  type LoaderFunction,
  type ActionFunction,
  redirect,
} from '@remix-run/node'
import { authenticator } from '~/services/auth.server'
import { getSessionRequest } from '~/utils/session.server'

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.clone().formData()
  const loginType = formData.get('loginType')

  if (loginType === 'gitlab') {
    return await authenticator.authenticate('gitlab', request)
  } else if (loginType === 'slack') {
    // Implement Slack login logic here
    console.log('Slack login initiated')
    // For demonstration, we'll just return a success message
    return json({ success: true, message: 'Slack login initiated' })
  }

  return json({ success: false, message: 'Invalid login type' })
}

export const loader: LoaderFunction = async ({ request }) => {
  const session = await getSessionRequest(request),
    user = session.get('accessToken')

  if (user) throw redirect('/')
  return null
}

export default function LoginPage() {
  const actionData = useActionData<typeof action>()

  return (
    <div className='min-h-screen flex items-center justify-center bg-gray-100'>
      <Card className='w-full max-w-md'>
        <CardHeader className='space-y-1'>
          <div className='flex items-center justify-center space-x-2'>
            <Logo className='w-8 h-8' />
            <h2 className='text-2xl font-bold'>Release Dashboard</h2>
          </div>
        </CardHeader>
        <CardContent className='space-y-4'>
          <Form method='post'>
            <input type='hidden' name='loginType' value='gitlab' />
            <Button type='submit' variant='outline' className='w-full'>
              <GitLabIcon className='mr-2 h-4 w-4' />
              Login with GitLab
            </Button>
          </Form>
          <Form method='post'>
            <input type='hidden' name='loginType' value='slack' />
            <Button type='submit' variant='outline' className='w-full'>
              <SlackIcon className='mr-2 h-4 w-4' />
              Login with Slack
            </Button>
          </Form>
          {actionData?.message && (
            <p
              className={`text-center ${
                actionData.success ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {actionData.message}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function GitLabIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' {...props}>
      <path d='M23.955 13.587l-1.342-4.135-2.664-8.189a.455.455 0 00-.867 0L16.418 9.45H7.582L4.918 1.263a.455.455 0 00-.867 0L1.386 9.45.044 13.587a.924.924 0 00.331 1.006L12 23.054l11.625-8.461a.92.92 0 00.33-1.006' />
    </svg>
  )
}

function SlackIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox='0 0 24 24' fill='currentColor' {...props}>
      <path d='M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z' />
    </svg>
  )
}
