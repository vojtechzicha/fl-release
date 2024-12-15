// app/sessions.ts
import {
  createCookieSessionStorage,
  redirect,
  type Session,
} from '@remix-run/node'

// Ensure the SESSION_SECRET variable is set
const sessionSecret = process.env.SESSION_SECRET
if (!sessionSecret) {
  throw new Error('SESSION_SECRET must be set in environment variables')
}

// Configure session storage using cookies
const storage = createCookieSessionStorage({
  cookie: {
    name: '__session', // Name of the cookie
    secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
    secrets: [sessionSecret], // Secret(s) for signing the cookie
    sameSite: 'lax', // Controls when cookies are sent
    path: '/', // The path used for the cookie
    httpOnly: true, // Prevents client-side JavaScript from accessing the cookie
    maxAge: 60 * 60 * 24 * 7, // Cookie expiration: 1 week
  },
})

// Access environment variables safely
interface SessionData {
  accessToken: string // Example: GitLab OAuth access token
  refreshToken: string // Example: GitLab OAuth refresh token
  // Add other session fields as needed
}

// Helper function to get a user's session from request headers
export function getSessionRequest(request: Request) {
  return storage.getSession(request.headers.get('Cookie'))
}

// Helper function to get a user's session from a cookie string (for server-side usage)
export function getSession(cookieHeader: string | null) {
  return storage.getSession(cookieHeader)
}

// Helper function to commit (save) a session and set the 'Set-Cookie' header
export async function commitSession(session: Session, headers?: HeadersInit) {
  const cookie = await storage.commitSession(session)
  if (headers && headers instanceof Headers) {
    headers.set('Set-Cookie', cookie)
  } else {
    return cookie
  }
}

// Helper function to destroy a session (e.g., on logout)
export async function destroySession(session: Session, headers?: HeadersInit) {
  const cookie = await storage.destroySession(session)
  if (headers && headers instanceof Headers) {
    headers.set('Set-Cookie', cookie)
  } else {
    return cookie
  }
}

// Optionally, export storage if you need more advanced usage
export { storage }
