import { LoaderFunction, redirect } from '@remix-run/node'
import { useLoaderData, useNavigate } from '@remix-run/react'
import { ChangelogModal } from '~/components/changelog-modal'
import { getReleaseChangelog } from '~/services/gitlab.server'
import { getUserTokens } from '~/services/user.server'

export const loader: LoaderFunction = async ({ request, params }) => {
  const user = await getUserTokens(request)
  if (!user) throw redirect('/login')

  const changelog = await getReleaseChangelog(
    user.accessToken,
    request,
    params.ref ?? ''
  )
  console.log(changelog)

  return { ref: params.ref, changelog }
}

export default function Changelog() {
  const navigate = useNavigate()
  const { ref, changelog } = useLoaderData<typeof loader>()

  return (
    <ChangelogModal
      version={ref}
      changelog={changelog}
      onOpenChange={() => navigate('/deployments')}
    />
  )
}
