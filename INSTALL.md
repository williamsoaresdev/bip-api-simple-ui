# 🚀 Guia de Instalação - BIP API Angular UI

## ⚡ Instalação Rápida

### 1. **Pré-requisitos**
```bash
# Verificar versões necessárias
node --version    # Deve ser 18+
npm --version     # Deve ser 9+

# Instalar Angular CLI globalmente (se não tiver)
npm install -g @angular/cli@latest
```

### 2. **Clonar e Instalar**
```bash
# Navegar para o diretório do projeto
cd c:\repositories\bip-java\bip-api-simple-ui

# Instalar dependências
npm install

# Ou usar yarn (se preferir)
yarn install
```

### 3. **Configurar API**
Editar o arquivo `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',  // ← Ajustar conforme sua API
  apiTimeout: 30000,
  enableDevTools: true
};
```

### 4. **Executar**
```bash
# Modo desenvolvimento
ng serve

# Com porta específica
ng serve --port 4200

# Abrir automaticamente no browser
ng serve --open
```

### 5. **Acessar**
- 🌐 **URL**: http://localhost:4200
- 📱 **Mobile**: Responsive automático
- 🖥️ **Desktop**: Layout completo

## 🛠️ Scripts Úteis

```bash
# Desenvolvimento
npm start                    # ng serve
npm run build               # Build de desenvolvimento
npm run build:prod          # Build de produção
npm run test                # Testes unitários
npm run test:coverage       # Testes com coverage
npm run lint                # Verificar código

# Produção
npm run serve:prod          # Servir build de produção
```

## 🔧 Troubleshooting

### **Problema: Dependências não instalaram**
```bash
# Limpar cache
npm cache clean --force
rm -rf node_modules package-lock.json

# Reinstalar
npm install
```

### **Problema: Porta em uso**
```bash
# Usar porta diferente
ng serve --port 4201

# Ou matar processo na porta 4200
npx kill-port 4200
```

### **Problema: API não conecta**
1. ✅ Verificar se a API BIP está rodando
2. ✅ Confirmar URL em `environment.ts`
3. ✅ Verificar CORS na API
4. ✅ Testar endpoint: `http://localhost:8080/api/v1/beneficios/status`

### **Problema: Erros de TypeScript**
```bash
# Verificar versões
ng version

# Reinstalar Angular CLI
npm uninstall -g @angular/cli
npm install -g @angular/cli@latest
```

## 📦 Build para Produção

```bash
# Build otimizado
npm run build:prod

# Arquivos gerados em:
# dist/bip-api-angular-ui/

# Para servir localmente
npx http-server dist/bip-api-angular-ui
```

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com watch mode
npm test -- --watch

# Coverage report
npm run test:coverage
# Relatório em: coverage/lcov-report/index.html
```

## ✨ Features Prontas

- ✅ **Layout responsivo** com Angular Material
- ✅ **Listagem de benefícios** com tabela
- ✅ **Loading states** e tratamento de erros
- ✅ **Componentes reutilizáveis**
- ✅ **Services** com HttpClient
- ✅ **Roteamento** com lazy loading
- ✅ **TypeScript** com tipagem forte

## 🚧 Em Desenvolvimento

- ⚠️ **Formulários** de benefícios (criar/editar)
- ⚠️ **Módulo de transferências**
- ⚠️ **Dashboard** com estatísticas
- ⚠️ **Testes unitários** completos

## 📞 Suporte

### **Logs úteis:**
```bash
# Console do browser (F12)
# Verificar erros de rede, JavaScript

# Terminal onde roda ng serve
# Verificar erros de compilação

# Network tab (F12)
# Verificar chamadas para API
```

### **URLs importantes:**
- 🏠 **App**: http://localhost:4200
- 🔌 **API**: http://localhost:8080/api/v1
- 📊 **Status**: http://localhost:8080/api/v1/beneficios/status

### **Estrutura esperada da API:**
```json
GET /api/v1/beneficios
[
  {
    "id": 1,
    "nome": "Vale Alimentação",
    "descricao": "Benefício para alimentação",
    "valor": 500.00,
    "ativo": true,
    "criadoEm": "2025-01-24T09:26:49",
    "atualizadoEm": "2025-01-24T09:26:49",
    "versao": 0
  }
]
```

---

**🎯 Objetivo**: Interface moderna e funcional para consumir a BIP API
**⚡ Stack**: Angular 17 + TypeScript + Material Design + RxJS