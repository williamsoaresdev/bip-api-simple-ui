# BIP API Angular UI

## Visão Geral

- Interface web do sistema BIP para gestão de benefícios corporativos e transferências financeiras.
- Construída com Angular 20 em modo standalone, foco em performance e experiência moderna com Angular Material.
- Integração preparada para uma API REST por meio de serviços tipados, interceptors e proxy local.

## Principais Funcionalidades

- Dashboard com indicadores gerais e visão rápida do portfólio de benefícios.
- Módulo completo de benefícios: listagem, filtro por status, criação, edição, visualização detalhada e remoção.
- Gestão de transferências com formulários reativos, detalhamento e controles de status.
- Proteções globais com interceptors para autenticação, loading spinner, tratamento de erros e cache busting.
- Uso de Angular Signals para estado reativo e composição de dados sem dependência de bibliotecas extras.

## Stack & Arquitetura

- Angular 20, Angular Material e RxJS 7 com componentes standalone.
- Estrutura modular em `core`, `features` e `shared`, seguindo boas práticas de separação de responsabilidades.
- Serviços fortemente tipados (`src/app/core/services`) e modelos compartilhados (`src/app/core/models`).
- Pipes, guards e interceptors centralizados em `src/app/core` para reutilização e governança.
- Estilo global em SCSS com design system próprio e pré-tema do Angular Material.

## Pré-requisitos

- Node.js 18+ (recomendado 20 LTS).
- npm 9+.
- Backend BIP API ouvindo em `http://localhost:8080` (necessário para dados reais durante o desenvolvimento).

## Como Executar

1. Instale dependências: `npm install`.
2. Inicie o servidor de desenvolvimento com proxy para a API: `npm run start` (porta padrão 4200).
3. Acesse `http://localhost:4200` e certifique-se de que a API esteja ativa para evitar mensagens de erro provenientes dos interceptors.
4. Para executar sem proxy (ambientes alternativos), utilize `npm run start:no-proxy` e ajuste `apiUrl` em `src/environments/environment.ts`.

## Scripts Disponíveis

- `npm run start`: servidor de desenvolvimento com proxy (hot reload).
- `npm run build`: build em modo padrão.
- `npm run build:prod`: build otimizado com output hashing.
- `npm run test`: execução dos testes unitários via Karma/Jasmine.
- `npm run test:coverage`: testes com relatório de cobertura.
- `npm run lint`: verificação de lint com regras do Angular ESLint.

## Estrutura do Projeto

```text
src/
  app/
    core/          # Serviços, guards, interceptors, modelos e pipes reutilizáveis
    features/      # Domínios de negócio (dashboard, benefícios, transferências)
    shared/        # Componentes compartilhados e estilos globais
  environments/    # Configurações por ambiente (dev/prod)
  styles/          # SCSS global e variáveis de tema
```

## Configuração de Ambientes

- `src/environments/environment.ts`: apontado para `/api` com proxy (`proxy.conf.json`).
- `src/environments/environment.prod.ts`: ajuste `apiUrl` para o endpoint público da API antes de publicar.
- Ajuste de timeout (`apiTimeout`) e sinalização de DevTools (`enableDevTools`) disponível para customização rápida.

## Qualidade e Boas Práticas

- Projeto gerado com `strict mode` ativado, garantindo tipagem estrita e validações de template.
- Interceptors de erro tratam códigos HTTP padrão e redirecionam para login quando necessário.
- Serviço de benefícios encapsula mapeamento entre contratos de backend e frontend, reduzindo acoplamento.
- Loading global baseado em Angular Signals evita condições de corrida e melhora o feedback visual.

## Próximos Passos Recomendados

- Implementar telas de autenticação e fluxo de login para complementar o guard existente.
- Configurar pipelines de CI/CD com execução de lint, testes e build de produção.
- Publicar documentação de API contratada para alinhamento entre times frontend e backend.
