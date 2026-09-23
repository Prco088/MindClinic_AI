"use client";

import { useActionState } from "react";
import { login } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [errorMessage, dispatch, isPending] = useActionState(
    async (prevState: string | undefined, formData: FormData) => {
      try {
        const result = await login(formData);
        if (result?.error) {
          return result.error;
        }
      } catch (error) {
        if (error instanceof Error && error.message.includes("NEXT_REDIRECT")) {
          throw error;
        }
        return "Algo deu errado.";
      }
    },
    undefined
  );

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">MindClinic AI</CardTitle>
          <CardDescription className="text-center">
            Entre na sua conta para acessar o sistema.
          </CardDescription>
        </CardHeader>
        <form action={dispatch}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                disabled={isPending}
              />
            </div>
            {errorMessage && (
              <div className="text-sm font-medium text-destructive">
                {errorMessage}
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className="w-full" type="submit" disabled={isPending}>
              {isPending ? "Entrando..." : "Entrar"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
