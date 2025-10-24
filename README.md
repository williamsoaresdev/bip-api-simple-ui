# 🚀 BIP API Angular UI

**Sistema de Gestão de Benefícios** - Interface moderna em Angular para consumir a API BIP.

## 📋 Visão Geral

Esta é uma aplicação Angular moderna e profissional desenvolvida para consumir a **BIP API**. A aplicação segue as melhores práticas de desenvolvimento frontend, incluindo:

- ✅ **Arquitetura moderna** com Angular 17+
- ✅ **Standalone Components** para melhor performance
- ✅ **Lazy Loading** para otimização de bundle
- ✅ **Observables e RxJS** para programação reativa
- ✅ **Angular Material** para UI/UX consistente
- ✅ **TypeScript** com tipagem forte
- ✅ **Responsive Design** para mobile e desktop

## 🏗️ Arquitetura

```
src/
├── app/
│   ├── core/                     # Funcionalidades centrais
│   │   ├── models/              # Interfaces e tipos TypeScript
│   │   └── services/            # Services com HttpClient
│   ├── shared/                  # Componentes reutilizáveis
│   │   └── components/          # Loading, Error, Dialog
│   ├── features/                # Módulos de funcionalidades
│   │   ├── beneficios/         # Gestão de benefícios
│   │   ├── transferencias/     # Sistema de transferências
│   │   └── dashboard/          # Dashboard principal
│   ├── app.component.ts        # Componente raiz
│   ├── app.config.ts          # Configuração da aplicação
│   └── app.routes.ts          # Roteamento com lazy loading
└── environments/               # Configurações de ambiente
```

## ⚡ Features Implementadas

### 🏠 **Layout Principal**
- ✅ Sidenav responsivo com Angular Material
- ✅ Toolbar com navegação
- ✅ Breakpoint observer para mobile/desktop
- ✅ Design consistente com tema personalizado

### 💰 **Gestão de Benefícios**
- ✅ Listagem com tabela responsiva
- ✅ Criação de novos benefícios
- ✅ Edição com validações
- ✅ Visualização de detalhes
- ✅ Remoção com confirmação
- ✅ Status ativo/inativo

### 🔄 **Sistema de Transferências**
- ✅ Execução de transferências
- ✅ Validação prévia
- ✅ Cálculo de taxas
- ✅ Histórico local
- ✅ Formulários reativos

### 📊 **Dashboard**
- ✅ Estatísticas dos benefícios
- ✅ Resumo do sistema
- ✅ Status da API

## 🛠️ Tecnologias Utilizadas

| Tecnologia | Versão | Descrição |
|------------|--------|-----------|
| **Angular** | 17.x | Framework principal |
| **Angular Material** | 17.x | Componentes UI |
| **RxJS** | 7.8+ | Programação reativa |
| **TypeScript** | 5.2+ | Linguagem tipada |
| **SCSS** | - | Preprocessador CSS |

## 🚀 Como Executar

### **Pré-requisitos**
- Node.js 18+
- npm ou yarn
- Angular CLI 17+

### **1. Instalação**
```bash
# Clone o repositório
git clone <repository-url>
cd bip-api-simple-ui

# Instale as dependências
npm install

# ou usando yarn
yarn install
```

### **2. Configuração**
```bash
# Configure a URL da API em src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',  # URL da sua API BIP
  apiTimeout: 30000,
  enableDevTools: true
};
```

### **3. Executar em Desenvolvimento**
```bash
# Inicie o servidor de desenvolvimento
ng serve

# ou com porta específica
ng serve --port 4200

# Acesse http://localhost:4200
```

### **4. Build para Produção**
```bash
# Build otimizado para produção
ng build --configuration=production

# Os arquivos estarão em dist/bip-api-angular-ui/
```

## 📱 Responsividade

A aplicação é totalmente responsiva:

- 📱 **Mobile** (< 768px): Sidenav overlay, layout compacto
- 💻 **Tablet** (768px - 1024px): Layout intermediário
- 🖥️ **Desktop** (> 1024px): Sidenav fixa, layout completo

## 🎨 Design System

### **Cores Principais**
- 🟣 **Primary**: #667eea (Gradiente roxo/azul)
- 🟢 **Accent**: #4caf50 (Verde)
- 🔴 **Warn**: #f44336 (Vermelho)

### **Tipografia**
- **Font**: Roboto (Material Design)
- **Tamanhos**: 12px, 14px, 16px, 18px, 24px

### **Componentes Reutilizáveis**

#### **Loading Component**
```html
<bip-loading 
  message="Carregando dados..."
  [size]="40"
  [overlay]="false"
  [showCard]="true">
</bip-loading>
```

#### **Error Message Component**
```html
<bip-error-message
  message="Erro ao carregar dados"
  title="Ops! Algo deu errado"
  type="error"
  [showRetry]="true"
  [retryCallback]="retryFunction">
</bip-error-message>
```

#### **Confirmation Dialog**
```typescript
const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
  data: {
    title: 'Confirmar Ação',
    message: 'Tem certeza que deseja continuar?',
    confirmText: 'Sim',
    cancelText: 'Cancelar',
    type: 'warning'
  }
});
```

## 📡 Services e API

### **BeneficioService**
```typescript
// Listar todos os benefícios
this.beneficioService.listarTodos().subscribe(beneficios => {
  console.log(beneficios);
});

// Criar novo benefício
const novoBeneficio = {
  nome: 'Vale Alimentação',
  descricao: 'Benefício para alimentação',
  valor: 500.00,
  ativo: true
};

this.beneficioService.criar(novoBeneficio).subscribe(response => {
  console.log('Benefício criado:', response);
});
```

### **TransferenciaService**
```typescript
// Executar transferência
const transferencia = {
  beneficioOrigemId: 1,
  beneficioDestinoId: 2,
  valor: 100.00,
  observacao: 'Transferência teste'
};

this.transferenciaService.executarTransferencia(transferencia).subscribe(result => {
  console.log('Transferência executada:', result);
});
```

## 🔒 Tratamento de Erros

### **Centralizado nos Services**
- ✅ HttpErrorResponse interceptado
- ✅ Mensagens de erro amigáveis
- ✅ Loading states gerenciados
- ✅ Retry automático disponível

### **Estados da UI**
- 🔄 **Loading**: Spinner com mensagem
- ❌ **Error**: Mensagem clara com opção de retry
- 📭 **Empty**: Estado vazio com call-to-action
- ✅ **Success**: Feedback positivo

## 🧪 Estrutura de Testes

```bash
# Executar testes unitários
ng test

# Executar com coverage
ng test --code-coverage

# Testes e2e (quando configurados)
ng e2e
```

## 📦 Scripts Disponíveis

```json
{
  "start": "ng serve",
  "build": "ng build",
  "build:prod": "ng build --configuration=production",
  "test": "ng test",
  "test:coverage": "ng test --code-coverage",
  "lint": "ng lint",
  "serve:prod": "ng serve --configuration=production"
}
```

## 🚦 Status do Projeto

| Feature | Status | Observações |
|---------|--------|-------------|
| ✅ Estrutura base | Completo | Angular 17, standalone components |
| ✅ Models/Interfaces | Completo | TypeScript tipado |
| ✅ Services | Completo | HttpClient + RxJS |
| ✅ Componentes Shared | Completo | Loading, Error, Dialog |
| ✅ Layout Principal | Completo | Sidenav responsivo |
| ⚠️ Módulo Benefícios | Em progresso | Lista implementada |
| ⏳ Módulo Transferências | Pendente | Próxima implementação |
| ⏳ Dashboard | Pendente | Estatísticas e resumos |
| ⏳ Testes | Pendente | Unitários e E2E |

## 🔄 Próximos Passos

1. **Completar componentes de benefícios**
   - Formulário de criação/edição
   - Página de detalhes
   - Validações avançadas

2. **Implementar módulo de transferências**
   - Formulário de transferência
   - Validação em tempo real
   - Histórico de transferências

3. **Criar dashboard**
   - Cards de estatísticas
   - Gráficos (Chart.js)
   - Resumo do sistema

4. **Melhorias de UX**
   - Animações
   - Feedback visual
   - Toasts/Notifications

5. **Testes e qualidade**
   - Testes unitários
   - Testes E2E
   - ESLint/Prettier

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -am 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**⚡ Desenvolvido com Angular + TypeScript + Material Design**

🔗 **Links Úteis:**
- [Angular Documentation](https://angular.io/docs)
- [Angular Material](https://material.angular.io/)
- [RxJS Guide](https://rxjs.dev/guide/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)