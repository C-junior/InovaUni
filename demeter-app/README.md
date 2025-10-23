# Demeter - Aplicativo de Cálculo de ETo

Aplicativo web para cálculo de evapotranspiração de referência (ETo) usando o método FAO-56 Penman-Monteith para produtores agrícolas de Palmas (TO).

## Tecnologias Utilizadas

- **Vue 3** - Framework JavaScript progressivo
- **Vite** - Build tool e servidor de desenvolvimento
- **TailwindCSS v3.4.17** - Framework CSS utilitário
- **Firebase** - Autenticação e banco de dados
- **Pinia** - Gerenciamento de estado
- **Axios** - Cliente HTTP para APIs

## Configuração do Projeto

### 1. Instalação das Dependências

```bash
npm install
```

### 2. Configuração das Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure suas chaves de API:

```bash
cp .env.example .env
```

Edite o arquivo `.env` e adicione sua chave da OpenWeather API:

```env
VITE_OPENWEATHER_API_KEY=sua_chave_da_openweather_api_aqui
```

### 3. Configuração do Firebase

O projeto já está configurado com o Firebase. As configurações estão no arquivo `src/firebase.js`.

#### Funcionalidades Implementadas:
- ✅ Autenticação com Google OAuth
- ✅ Firestore Database com regras de segurança
- ✅ Isolamento de dados por usuário
- ✅ Gerenciamento de estado com Pinia

#### Estrutura do Banco de Dados:
```
users/{userId}/
├── farms/{farmId}           # Fazendas do usuário
└── calculations/{calcId}    # Histórico de cálculos
```

#### Regras de Segurança:
As regras do Firestore estão configuradas no arquivo `firestore.rules` para garantir que:
- Usuários só podem acessar seus próprios dados
- Autenticação é obrigatória para todas as operações
- Isolamento completo entre usuários diferentes

## Scripts Disponíveis

### Desenvolvimento

```bash
npm run dev
```

### Build para Produção

```bash
npm run build
```

### Preview da Build

```bash
npm run preview
```

### Linting

```bash
npm run lint
```

## Estrutura do Projeto

```
src/
├── assets/          # Arquivos estáticos (CSS, imagens)
├── components/      # Componentes Vue reutilizáveis
├── router/          # Configuração de rotas
├── stores/          # Stores Pinia para gerenciamento de estado
├── utils/           # Funções utilitárias
├── views/           # Componentes de página/view
├── firebase.js      # Configuração do Firebase
└── main.js          # Ponto de entrada da aplicação
```

## Paleta de Cores Institucional

- **Primary**: #65aa6e (Verde)
- **Secondary**: #2e3e7f (Azul)
- **Neutral**: #ffffff (Branco)

## Próximos Passos

1. Configure sua chave da OpenWeather API no arquivo `.env`
2. Execute `npm run dev` para iniciar o desenvolvimento
3. Acesse `http://localhost:5173` no seu navegador
