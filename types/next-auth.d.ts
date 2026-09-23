import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    tenantId: string;
  }

  interface Session {
    user: User;
  }
}
