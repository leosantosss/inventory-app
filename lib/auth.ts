import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import dbConnect from './mongodb'
import User from './models/User'

export const authOptions: NextAuthOptions = {
  debug: true,
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
        console.log('[auth] user found:', !!user, 'username:', credentials.username.toLowerCase())
        if (!user) return null
        const valid = await bcrypt.compare(credentials.password, user.passwordHash)
        console.log('[auth] password valid:', valid)
        if (!valid) return null
        return { id: user._id.toString(), name: user.displayName, username: user.username }
      },
    }),
  ],
  session: { strategy: 'jwt' },
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
