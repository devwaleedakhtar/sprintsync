import NextAuth, { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import api from "@/app/lib/api";

const backendUrl = process.env.BACKEND_URL || "http://localhost:8000";

interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  accessToken: string;
  emailVerified: null;
}

const config: NextAuthConfig = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "email",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;
        try {
          // 1. Login to get the token
          const params = new URLSearchParams();
          params.append("username", String(credentials.email));
          params.append("password", String(credentials.password));

          const loginRes = await api.post(`${backendUrl}/auth/login`, params, {
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
          });
          const { access_token } = loginRes.data;
          if (!access_token) return null;

          // 2. Fetch user profile
          const userRes = await api.get(`${backendUrl}/users/me`, {
            headers: { Authorization: `Bearer ${access_token}` },
          });
          const user = userRes.data;
          if (!user || !user.id || !user.email) return null;

          // 3. Return user object with token
          return {
            ...user,
            id: user.id.toString(),
            accessToken: access_token,
            emailVerified: null,
          } satisfies UserProfile & { emailVerified: null };
        } catch {
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 60, // 30 minutes
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user && typeof user === "object") {
        token.user = user;
        token.accessToken = (user as UserProfile).accessToken;
      }
      return token;
    },
    async session({ session, token }) {
      if (token.user) {
        session.user = token.user as UserProfile;
        (session as typeof session & { accessToken?: string }).accessToken =
          token.accessToken as string;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);

export type { UserProfile };
