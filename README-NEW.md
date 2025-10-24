# BIP API Simple UI - Angular Frontend

Uma aplicação Angular moderna e otimizada para gerenciamento de benefícios e transferências, integrada com a API BIP Java.

## 🚀 Características

- **Angular 17** com Standalone Components
- **Angular Material** para UI/UX profissional
- **TypeScript** com tipagem estrita
- **RxJS** para programação reativa
- **Lazy Loading** para performance otimizada
- **Responsive Design** para mobile e desktop
- **Acessibilidade (a11y)** completa
- **Error Handling** centralizado
- **Interceptors** para loading e tratamento de erros

## 📋 Funcionalidades

### 🎯 **Módulo Benefícios**
- ✅ Listagem de benefícios com filtros
- ✅ Criação de novos benefícios
- ✅ Edição de benefícios existentes
- ✅ Exclusão de benefícios
- ✅ Visualização detalhada

### 💸 **Módulo Transferências**
- ✅ Listagem de transferências
- ✅ Criação de novas transferências
- ✅ Histórico completo
- ✅ Validações de saldo

### 📊 **Dashboard**
- ✅ Visão geral do sistema
- ✅ Estatísticas em tempo real
- ✅ Gráficos e métricas

## 🛠️ Tecnologias Utilizadas

- **Frontend**: Angular 17, TypeScript 5.2
- **UI Library**: Angular Material 17
- **Styling**: SCSS com CSS Custom Properties
- **State Management**: RxJS + BehaviorSubject
- **HTTP Client**: Angular HttpClient com Interceptors
- **Build Tool**: Angular CLI
- **Testing**: Jasmine + Karma

## 📦 Instalação

### Pré-requisitos
- Node.js 18+ 
- npm 9+
- Angular CLI 17+

### Passos

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd bip-api-simple-ui
```

2. **Instale as dependências**
```bash
npm install
```

3. **Configure o backend**
```bash
# Edite proxy.conf.json se necessário
# Por padrão, aponta para http://localhost:8080
```

4. **Execute o projeto**
```bash
npm start
```

5. **Acesse a aplicação**
```
http://localhost:4200
```

## 🔧 Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia o servidor de desenvolvimento
npm run build          # Build de produção
npm run build:dev      # Build de desenvolvimento
npm test               # Executa testes unitários
npm run lint           # Executa linting
npm run e2e            # Executa testes e2e
```

## 🏗️ Arquitetura

### Estrutura de Pastas
```
src/
├── app/
│   ├── core/                    # Serviços, guards, interceptors
│   │   ├── guards/             # Route guards
│   │   ├── interceptors/       # HTTP interceptors
│   │   ├── models/             # Interfaces TypeScript
│   │   ├── resolvers/          # Data resolvers
│   │   └── services/           # Serviços de negócio
│   ├── features/               # Módulos funcionais
│   │   ├── beneficios/         # Módulo de benefícios
│   │   ├── dashboard/          # Dashboard principal
│   │   └── transferencias/     # Módulo de transferências
│   ├── shared/                 # Componentes compartilhados
│   │   └── components/         # Componentes reutilizáveis
│   └── styles/                 # Estilos globais e temas
├── assets/                     # Recursos estáticos
└── environments/               # Configurações de ambiente
```

### Padrões Implementados

- **Standalone Components**: Arquitetura moderna sem NgModules
- **Lazy Loading**: Carregamento sob demanda para performance
- **OnPush Strategy**: Change detection otimizada
- **TrackBy Functions**: Performance otimizada em listas
- **shareReplay**: Cache de observables
- **OnDestroy Pattern**: Gestão de memória com unsubscribe automático

## 🎨 Theme System

O projeto utiliza um sistema de tema profissional com:

- **CSS Custom Properties** para consistência
- **Material Design** customizado
- **Responsive Breakpoints** para todos os dispositivos
- **Dark/Light Mode** suporte (preparado)
- **Componentes reutilizáveis** padronizados

## 🔒 Segurança e Performance

### Performance
- ✅ **ChangeDetectionStrategy.OnPush** em componentes
- ✅ **shareReplay(1)** em observables dos serviços
- ✅ **trackBy functions** em *ngFor loops
- ✅ **Lazy loading** de módulos
- ✅ **Tree shaking** automático

### Acessibilidade
- ✅ **ARIA labels** completos
- ✅ **Semantic HTML** estruturado
- ✅ **Keyboard navigation** suportada
- ✅ **Screen reader** compatível

### Error Handling
- ✅ **Global error interceptor** com mensagens contextuais
- ✅ **Loading states** centralizados
- ✅ **Retry mechanisms** automáticos
- ✅ **User feedback** via snackbar

## 🔌 Integração com Backend

### Configuração de Proxy
```json
{
  "/api/*": {
    "target": "http://localhost:8080",
    "secure": true,
    "changeOrigin": true
  }
}
```

### Endpoints Utilizados
- `GET /api/beneficios` - Lista benefícios
- `POST /api/beneficios` - Cria benefício
- `PUT /api/beneficios/{id}` - Atualiza benefício
- `DELETE /api/beneficios/{id}` - Remove benefício
- `GET /api/transferencias` - Lista transferências
- `POST /api/transferencias` - Cria transferência

## 📱 Responsive Design

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: 320px, 768px, 1024px, 1440px
- **Touch Friendly**: Botões e interações adequadas para touch
- **Performance**: Carregamento otimizado em conexões lentas

## 🚀 Deploy

### Build de Produção
```bash
npm run build
```

### Configurações de Ambiente
```typescript
// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://sua-api.com/api'
};
```

### Docker (Opcional)
```dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist/bip-api-angular-ui /usr/share/nginx/html
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage

# Testes e2e
npm run e2e
```

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📞 Suporte

Para suporte, abra uma issue no GitHub ou entre em contato através do email.

---

**Desenvolvido com ❤️ usando Angular 17 e Angular Material**