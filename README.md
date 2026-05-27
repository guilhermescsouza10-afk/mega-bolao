# Mega Bolão - Bolão Copa do Mundo 2026

App PWA mobile-first para bolão de futebol da Copa do Mundo FIFA 2026.

## Stack

- **Frontend:** React 18 + Tailwind CSS + Vite
- **Backend:** Firebase (Firestore, Auth, Cloud Functions, Hosting, FCM)
- **PWA:** vite-plugin-pwa com Service Worker

## Pré-requisitos

- Node.js 20+
- Firebase CLI (`npm install -g firebase-tools`)
- Projeto Firebase criado em [console.firebase.google.com](https://console.firebase.google.com)

## Setup

### 1. Instalar dependências

```bash
npm install
cd functions && npm install && cd ..
```

### 2. Configurar Firebase

Crie um arquivo `.env` na raiz com suas credenciais Firebase:

```env
VITE_FIREBASE_API_KEY=sua-api-key
VITE_FIREBASE_AUTH_DOMAIN=seu-projeto.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=seu-projeto-id
VITE_FIREBASE_STORAGE_BUCKET=seu-projeto.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=sua-vapid-key
```

### 3. Configurar Firebase Auth

No Console Firebase:
1. Vá em **Authentication > Sign-in method**
2. Habilite **Google** como provedor de login
3. Adicione o domínio do seu app em **Authorized domains**

### 4. Popular o Firestore (Seed)

```bash
# Defina a variável de ambiente com o caminho da chave de serviço
export GOOGLE_APPLICATION_CREDENTIALS="caminho/para/serviceAccountKey.json"

# Ou use o Project ID diretamente
export FIREBASE_PROJECT_ID="seu-projeto-id"

# Execute o seed
npm run seed
```

Isso criará:
- 48 seleções em `/selecoes`
- 104 jogos em `/jogos`
- Jogadores para autocomplete em `/jogadores`

### 5. Deploy das Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 6. Deploy das Cloud Functions

```bash
cd functions
npm run build
cd ..
firebase deploy --only functions
```

### 7. Desenvolvimento local

```bash
npm run dev
```

### 8. Build e Deploy para produção

```bash
npm run build
firebase deploy --only hosting
```

## Testes

```bash
npm test           # modo watch
npm run test:run   # execução única
```

Os testes cobrem os 7 cenários de pontuação:

| Regra | Condição | Pontos |
|-------|----------|--------|
| 1 | Placar exato | +25 |
| 2 | Vencedor + gols do vencedor | +15 |
| 3 | Vencedor + saldo de gols | +15 |
| 4 | Vencedor + gols do perdedor | +12 |
| 5 | Apenas o vencedor | +6 |
| 6 | Gols de um time (vencedor errado) | +3 |
| 7 | Nenhum acerto | +0 |

## Estrutura do Projeto

```
entre-amigos/
├── src/
│   ├── components/     # Componentes reutilizáveis
│   ├── pages/          # Páginas do app
│   ├── contexts/       # Context API (Auth)
│   ├── data/           # Dados estáticos (times, jogos, jogadores)
│   ├── utils/          # Utilitários (scoring, datas)
│   ├── App.jsx         # Roteamento principal
│   ├── firebase.js     # Configuração Firebase
│   └── main.jsx        # Entry point
├── functions/
│   └── src/            # Cloud Functions (TypeScript)
├── tests/              # Testes unitários
├── firestore.rules     # Regras de segurança
├── firebase.json       # Configuração Firebase
└── package.json
```

### 9. Configurar API de Resultados (football-data.org)

```bash
# Registre-se gratuitamente em football-data.org/client/register
# Depois configure a chave:
firebase functions:config:set football.api_key="SUA_CHAVE_AQUI"

# Ou via Firebase Functions params:
firebase functions:secrets:set FOOTBALL_API_KEY
```

A function `sincronizarResultados` roda a cada 5 minutos e automaticamente:
1. Busca resultados finalizados na API
2. Atualiza o Firestore com o placar
3. Calcula a pontuação de todos os palpites
4. Propaga vencedores para a próxima fase do mata-mata
5. Quando todos os 72 jogos de grupo terminam, preenche automaticamente as oitavas

## Cloud Functions

| Função | Trigger | Descrição |
|--------|---------|-----------|
| `sincronizarResultados` | Scheduled (5min) | Busca resultados da API football-data.org, calcula pontuação e propaga bracket |
| `calcularPontuacaoJogo` | onCall | Calcula pontuação manualmente (fallback do admin) |
| `calcularPontuacaoBonus` | onCall | Calcula pontuação bônus ao final do torneio |
| `classificacaoGrupos` | onCall | Retorna a classificação de todos os 12 grupos |
| `forcarPopulacaoR32` | onCall | Preenche manualmente as oitavas a partir da classificação |
| `bloquearPalpites` | Scheduled (15min) | Bloqueia palpites 1h antes de cada jogo |
| `enviarNotificacaoPrazo` | Scheduled (30min) | Envia push notification 2h antes dos jogos |

## Chaveamento Automático

O sistema gerencia automaticamente todo o bracket da fase eliminatória:

1. **Classificação dos Grupos** — calcula pontos, saldo de gols, gols marcados
2. **8 Melhores Terceiros** — seleciona os 8 melhores 3os colocados dos 12 grupos
3. **Oitavas de Final** — preenche os 16 jogos com base na classificação
4. **Propagação** — ao finalizar cada jogo eliminatório, o vencedor é automaticamente
   inserido no próximo jogo da chave (quartas → semis → final)
5. **Disputa de 3o lugar** — os perdedores das semifinais são inseridos automaticamente

## Funcionalidades

- Login via Google
- Criação de grupos com link de convite compartilhável
- Palpites com interface de "cartão de placar" (botões +/-)
- Sistema de pontuação automático com 7 regras hierárquicas
- Ranking em tempo real com animação de confete
- Perguntas bônus (campeão, vice, artilheiro)
- Resultados automáticos via football-data.org API
- Classificação dos grupos com tabela ao vivo
- Chaveamento completo do mata-mata com propagação automática
- Notificações push (FCM) para prazos e resultados
- Tema escuro nativo
- PWA instalável (iOS/Android)
- Compartilhamento via WhatsApp
