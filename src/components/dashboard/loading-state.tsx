import { Loader2 } from "lucide-react"

export function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center p-12 w-full h-full min-h-[200px]">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Carregando...</p>
    </div>
  )
}
