import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  session: {
    strategy: "jwt",
    maxAge: 4 * 60 * 60, // 4 hours
    updateAge: 60 * 60,  // 1 hour
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const role = auth?.user?.role;
      
      const isPatientRoute = nextUrl.pathname.startsWith("/patient");
      const isProtectedRoute = nextUrl.pathname.startsWith("/dashboard") || 
                               nextUrl.pathname.startsWith("/patients") ||
                               nextUrl.pathname.startsWith("/appointments") ||
                               nextUrl.pathname.startsWith("/records") ||
                               nextUrl.pathname.startsWith("/admin");
      
      // Patient routes
      if (isPatientRoute) {
        if (nextUrl.pathname === "/patient/login") {
          if (isLoggedIn && role === "PATIENT") {
            return Response.redirect(new URL("/patient/dashboard", nextUrl));
          }
          return true; // allow unauthenticated to see login
        }
        
        if (!isLoggedIn) {
          return Response.redirect(new URL("/patient/login", nextUrl));
        }
        
        if (role !== "PATIENT") {
           return Response.redirect(new URL("/dashboard", nextUrl));
        }
        
        return true;
      }

      // Professional routes
      if (isProtectedRoute) {
        if (!isLoggedIn) return false;
        
        if (role === "PATIENT") {
          return Response.redirect(new URL("/patient/dashboard", nextUrl));
        }
        return true;
      } else if (isLoggedIn && nextUrl.pathname === "/login") {
        if (role === "PATIENT") {
          return Response.redirect(new URL("/patient/dashboard", nextUrl));
        }
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.tenantId = user.tenantId;
        token.type = user.type;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.role = token.role as string;
        session.user.tenantId = token.tenantId as string;
        session.user.type = token.type as string;
      }
      return session;
    },
  },
  providers: [], // Configured in auth.ts
} satisfies NextAuthConfig;
