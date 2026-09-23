import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="px-6 lg:px-12 h-16 flex items-center border-b bg-background">
        <Link className="flex items-center justify-center font-bold text-xl" href="#">
          MindClinic AI
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#features">
            Recursos
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#benefits">
            Benefícios
          </Link>
          <Link className="text-sm font-medium hover:underline underline-offset-4" href="#security">
            Segurança
          </Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-muted/40">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="flex flex-col items-center space-y-4 text-center">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none">
                Revolucione seus Atendimentos com IA
              </h1>
              <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                Plataforma completa para profissionais de saúde mental. Gestão, prontuários eletrônicos e transcrições de sessões, tudo seguro e de acordo com a LGPD.
              </p>
            </div>
            <div className="space-x-4">
              <Button size="lg">Experimente Gratuitamente</Button>
              <Button variant="outline" size="lg">Saiba Mais</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6 mx-auto">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-center mb-12">Recursos Principais</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Gestão de Agenda</h3>
              <p className="text-muted-foreground">Otimize seu tempo com uma agenda inteligente integrada e lembretes automáticos.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Transcrições com IA</h3>
              <p className="text-muted-foreground">Foque no paciente. A Inteligência Artificial cuida das anotações das suas sessões.</p>
            </div>
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="p-4 bg-primary/10 rounded-full">
                <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Prontuário Eletrônico</h3>
              <p className="text-muted-foreground">Acesse o histórico e evolução de cada paciente de forma rápida e segura.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits & Security Section */}
      <section id="security" className="w-full py-12 md:py-24 lg:py-32 bg-muted/40">
        <div className="container px-4 md:px-6 mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl mb-4">
                Total Conformidade com a LGPD
              </h2>
              <p className="text-muted-foreground md:text-lg mb-6">
                A privacidade dos seus pacientes é nossa prioridade. 
                Os dados são protegidos com criptografia de ponta a ponta e anonimização nas transcrições por IA.
              </p>
              <ul className="space-y-3">
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Criptografia AES-256
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Anonimização de Prontuários
                </li>
                <li className="flex items-center">
                  <svg className="w-5 h-5 mr-2 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                  Controle total de Acessos
                </li>
              </ul>
            </div>
            <div className="bg-background p-8 rounded-xl border shadow-sm">
              <h3 className="text-xl font-bold mb-4">Experimente o futuro da sua clínica</h3>
              <p className="text-muted-foreground mb-6">Junte-se a centenas de profissionais de saúde mental que já transformaram seus atendimentos.</p>
              <Button className="w-full" size="lg">Criar Minha Conta</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t bg-background py-6 text-center text-sm text-muted-foreground">
        <div className="container mx-auto">
          <p>&copy; {new Date().getFullYear()} MindClinic AI. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
