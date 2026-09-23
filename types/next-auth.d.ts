import "next-auth";

declare module "next-auth" {
  interface User {
    role: string;
    tenantId: string;
    type?: string;
  }

  interface Session {
    user: User;
  }
}
