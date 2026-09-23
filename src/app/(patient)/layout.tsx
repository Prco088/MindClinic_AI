import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Área do Paciente - MindClinic AI",
  description: "Acesse seu portal de paciente",
};

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { PatientSidebar } from "@/components/patient/patient-sidebar";
import { PatientHeader } from "@/components/patient/patient-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader as SheetHeaderUI } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If we are on the login page, we shouldn't show the sidebar. 
  // Wait, layout wraps everything in (patient). The login page is in (patient)/patient/login.
  // Wait! If the login page is inside (patient), it will render this layout! 
  // We can't use this layout for the login page!
  // I should check how it was structured in Phase 6.7.1. 
  // Wait, I will just do a check: if not logged in, just render children (which will be the login page).
  if (!session?.user) {
    return (
      <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950">
        <main className="flex-1">{children}</main>
      </div>
    );
  }

  if (session.user.type !== "PATIENT") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex p-4">
        <div className="mb-8 px-2">
          <h2 className="text-2xl font-bold tracking-tight text-primary">Portal do Paciente</h2>
        </div>
        <PatientSidebar />
      </aside>

      {/* Main Content Area */}
      <main className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-16 items-center gap-4 border-b bg-background px-6">
          {/* Mobile Sidebar Trigger */}
          <Sheet>
            <SheetTrigger render={
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            } />
            <SheetContent side="left" className="w-64 p-4">
              <SheetHeaderUI className="mb-8 text-left">
                <SheetTitle className="text-2xl font-bold tracking-tight text-primary">Portal do Paciente</SheetTitle>
              </SheetHeaderUI>
              <PatientSidebar />
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <PatientHeader user={session.user} />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
