import { PageHeader } from "@/components/dashboard/page-header"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SettingsPage() {
  return (
    <div className="space-y-8 animate-in fade-in-50 duration-500 max-w-4xl mx-auto">
      <PageHeader 
        title="Configurações" 
        description="Ajuste as preferências da sua conta e da clínica."
      />

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Perfil Profissional</CardTitle>
            <CardDescription>
              Atualize as informações do seu perfil público.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input id="name" defaultValue="Dr(a). Teste" disabled />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email de Contato</Label>
              <Input id="email" type="email" defaultValue="contato@exemplo.com" disabled />
            </div>
            <Button disabled>Salvar Alterações</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configurações da Clínica</CardTitle>
            <CardDescription>
              Ajuste as informações da clínica.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Opções de personalização de fuso horário, logo e horários de atendimento em breve.
            </p>
            <Button variant="outline" disabled>Em breve</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
