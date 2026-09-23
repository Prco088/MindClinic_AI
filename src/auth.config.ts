import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard") || 
                               nextUrl.pathname.startsWith("/patients") ||
                               nextUrl.pathname.startsWith("/appointments") ||
                               nextUrl.pathname.startsWith("/records");
                               
      if (isProtectedRoute) {
        if (isLoggedIn) return true;
        return false; // Redirect unauthenticated users to login page
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
