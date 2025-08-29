import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    })
  ],
  pages: {
    signIn: '/signup',
    signOut: '/signup',
    error: '/signup', // Error code passed in query string as ?error=
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      // You can add custom logic here to save user to your backend
      if (account?.provider === "google") {
        try {
          // Call backend API to create/update user
          const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'
          const response = await fetch(`${backendUrl}/api/auth/google-signin`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: user.email,
              name: user.name,
              image: user.image,
              googleId: account.providerAccountId,
            }),
          })
          
          if (response.ok) {
            const data = await response.json()
            console.log('Backend auth successful:', data.message)
            return true
          } else {
            const errorData = await response.text()
            console.error('Backend auth failed:', response.status, errorData)
            return false
          }
        } catch (error) {
          console.error('Error calling backend during sign in:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, account, user }) {
      // Persist the OAuth access_token and or the user id to the token right after signin
      if (account) {
        token.accessToken = account.access_token
      }
      if (user) {
        token.id = user.id
      }
      return token
    },
    async session({ session, token }) {
      // Send properties to the client
      if (token) {
        session.accessToken = token.accessToken
        session.user.id = token.id
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      // Default redirect to dashboard after successful login
      return `${baseUrl}/dashboard`
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }