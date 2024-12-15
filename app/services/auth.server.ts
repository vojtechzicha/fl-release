import { Authenticator } from 'remix-auth'
import { OAuth2Strategy } from 'remix-auth-oauth2'

import { type User } from '../utils/user.server'

// Create an instance of the authenticator
export const authenticator = new Authenticator<User>()

console.log('GITLAB_CLIENT_ID', process.env.GITLAB_ROOT_URL)

authenticator.use(
  new OAuth2Strategy(
    {
      clientId: process.env.GITLAB_CLIENT_ID!,
      clientSecret: process.env.GITLAB_CLIENT_SECRET!,

      authorizationEndpoint: `${process.env.GITLAB_ROOT_URL}oauth/authorize`,
      tokenEndpoint: `${process.env.GITLAB_ROOT_URL}oauth/token`,
      redirectURI: process.env.GITLAB_REDIRECT_URI!,

      tokenRevocationEndpoint: `${process.env.GITLAB_ROOT_URL}oauth/revoke`,

      scopes: [],
    },
    async ({ tokens }) => {
      return {
        accessToken: tokens.accessToken(),
        refreshToken: tokens.refreshToken(),
      }
    }
  ),
  'gitlab'
)
