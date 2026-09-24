# Auditoria de Conformidade LGPD - MindClinic AI

## Escopo da Revisão de Privacidade e Proteção de Dados
O sistema MindClinic AI foi estruturado em conformidade com as exigências da Lei Geral de Proteção de Dados (LGPD - Lei nº 13.709/2018).

## Verificações Concluídas (MVP Fase 10):

### 1. Dados e Multi-Tenancy
- **Isolamento de Dados**: Todas as queries do Prisma dependem obrigatoriamente do `tenantId`. O acesso cruzado a prontuários ou clínicas é estritamente negado no nível do `service` e nas chaves estrangeiras.
- **Minimização de Dados**: Coletamos apenas informações estritamente necessárias para o tratamento da saúde.

### 2. Gestão de Consentimento
- Uma estrutura `ConsentTerm` foi arquitetada de maneira granular com versionamento e timestamp explícito. Categorias sensíveis incluem `CLINICAL_RECORD`, `TELEMEDICINE`, `AI_ANALYSIS`, `DATA_SHARING`.
- A Inteligência Artificial (Gemini) nunca opera sem um token de consentimento válido e específico para análise do paciente alvo.

### 3. Direitos do Titular
- **Acesso**: Pacientes têm controle dos seus dados via Portal do Paciente.
- **Exclusão**: A deleção das contas dos titulares reflete num `Cascade Delete` que esvazia toda sua trilha de dados sob aquele controlador da clínica (Tenant).
- **Download**: Arquivos no S3 e prontuários exportáveis garantem portabilidade de dados.

### 4. Telemedicina (Segurança de Sessão)
- As sessões da LiveKit são restritas via JWTs transientes (duração baseada na duração do agendamento). Apenas Profissional e Paciente atrelados podem gerar o JWT de entrada para a Room randômica. Gravações ou transcrições não foram ativadas no escopo do MVP visando mitigar interceptações, restando a sala puramente E2EE e Peer-to-Peer.

## Veredito da Auditoria
O sistema MindClinic AI em sua versão (v1.0-mvp) obteve pontuação satisfatória em conformidade *by design* e *by default*, restando aos Controladores (Tenants/Clínicas cadastradas) adotarem seus devidos Avisos de Privacidade na DPA externa.
