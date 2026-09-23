import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { SidebarNav } from "@/components/dashboard/sidebar-nav"
import { UserNav } from "@/components/dashboard/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row bg-muted/40">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 flex-col border-r bg-background md:flex p-4">
        <div className="mb-8 px-2">
          <h2 className="text-2xl font-bold tracking-tight text-primary">MindClinic AI</h2>
        </div>
        <SidebarNav />
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
              <SheetHeader className="mb-8 text-left">
                <SheetTitle className="text-2xl font-bold tracking-tight text-primary">MindClinic AI</SheetTitle>
              </SheetHeader>
              <SidebarNav />
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-4">
            <ThemeToggle />
            <UserNav user={session.user} />
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  )
}
