import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from './mongodb'
import User from './models/User'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) return null
        await dbConnect()
        const user = await User.findOne({ username: credentials.username.toLowerCase() })
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        if (!valid) return null
        return { id: user._id.toString(), name: user.displayName, username: user.username }
      },
    }),
  ],
  // Idle-based logout is enforced client-side (components/IdleTimeout.tsx); these are
  // a server-side backstop so a session can never outlive a single work shift even if
  // the client-side timer never runs (e.g. JS disabled).
  session: { strategy: 'jwt', maxAge: 60 * 60 * 4, updateAge: 60 * 15 },
  pages: { signIn: '/login' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.username = (user as { username?: string }).username ?? ''
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.username = token.username
        ;(session.user as { id?: string }).id = token.id as string
      }
      return session
    },
  },
}
