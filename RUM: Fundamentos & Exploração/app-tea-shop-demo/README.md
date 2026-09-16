# Tea Shop Demo - Datadog RUM + Session Replay

Aplicacao local para demonstracao e treinamento de Datadog RUM + Session Replay. O projeto sobe um mini e-commerce em React/Vite, uma API Express com latencia e erros controlados, e um bot Playwright que abre Chromium e interage com o DOM como usuarios reais.

## Como rodar

```bash
docker compose up --build
```

Servicos:

- Frontend: http://localhost:5173
- Backend: http://localhost:3000
- Bot: roda continuamente dentro do Docker

Para parar:

```bash
docker compose down
```

## Configurar Datadog RUM

1. Copie o exemplo:

```bash
cp .env.example .env
```

2. Preencha no `.env`:

```bash
VITE_DD_APPLICATION_ID=seu_application_id
VITE_DD_CLIENT_TOKEN=seu_client_token
VITE_DD_SITE=datadoghq.com
VITE_DD_SERVICE=tea-shop-demo
VITE_DD_ENV=local
VITE_DD_VERSION=1.0.0
```

Use `datadoghq.com`, `datadoghq.eu`, `us3.datadoghq.com`, `us5.datadoghq.com`, `ap1.datadoghq.com` ou o site da sua organizacao.

O client token de RUM e publico por natureza, pois roda no browser. Nao coloque API Key, Application Key ou qualquer segredo do Datadog no frontend.

Se `VITE_DD_APPLICATION_ID` ou `VITE_DD_CLIENT_TOKEN` ficarem vazios, a aplicacao continua funcionando localmente e apenas nao inicializa o RUM.

Referencias oficiais:

- Browser RUM setup: https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/setup/client/
- Browser advanced configuration e React Router: https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/advanced_configuration/
- Frustration Signals: https://docs.datadoghq.com/real_user_monitoring/application_monitoring/browser/frustration_signals/
- Session Replay: https://docs.datadoghq.com/session_replay/browser/

## O que a demo contem

Rotas reais:

- `/`
- `/frustration-signals`
- `/products`
- `/products/:id`
- `/cart`
- `/checkout`
- `/order-confirmation`
- `/account`
- `/support`

Fluxos principais:

- Listagem, busca e filtro por categoria.
- Detalhe de produto.
- Carrinho com drawer, quantidade e remocao.
- Checkout com formulario e pagamento fake.
- Confirmacao de pedido.
- Conta com dados fake.
- Suporte com formulario.
- Loading states e erros controlados.
- Scroll em lista longa de produtos.
- Laboratorio isolado para Rage Click, Dead Click e Error Click.

Erros controlados:

- Produto inexistente: acesse `/products/unknown-tea`.
- Busca com falha: em `/products`, use o botao `Trigger search error`.
- Pagamento recusado: no checkout, selecione `Unstable card (demo error)` ou marque `Force payment failure`.
- Suporte com falha: envie um ticket com assunto contendo `erro` ou email contendo `fail`.

## Integracao RUM

O frontend inicializa `@datadog/browser-rum` em `frontend/src/datadog.ts` com:

- `sessionSampleRate: 100`
- `sessionReplaySampleRate: 100`
- `trackUserInteractions: true`
- `trackResources: true`
- `trackLongTasks: true`
- `trackViewsManually: true`
- `defaultPrivacyLevel: 'mask-user-input'`

O frontend e o plugin React usam a mesma major do Browser SDK. No SDK v7, o header W3C `baggage` e propagado por padrao nas URLs rastreadas; por isso o CORS do backend permite `baggage`, `traceparent` e `tracestate`.

As views sao iniciadas manualmente a cada troca de rota do React Router. O projeto tambem envia actions customizadas:

- `product_added_to_cart`
- `checkout_started`
- `checkout_completed`
- `support_ticket_submitted`

O SDK inicia Session Replay automaticamente quando a sessao entra na amostra de replay. Por isso a demo usa `sessionReplaySampleRate: 100` e nao chama `startSessionReplayRecording()` manualmente.

## Demonstrar Frustration Signals

Abra http://localhost:5173/frustration-signals ou use o link `Frustration Lab` no menu.

Para deixar o RUM Explorer limpo durante a aula, voce pode pausar apenas o gerador de usuarios antes da demonstracao:

```bash
docker compose stop bot
```

Cada alvo possui `data-dd-action-name`, para que a action tenha um nome legivel no RUM Explorer:

- Rage Click: clique em `Clique rapidamente aqui` pelo menos 4 vezes em menos de 1 segundo, sem mover o mouse. O contador ao lado muda a cada clique para produzir atividade de pagina e evitar que o mesmo alvo seja classificado como Dead Click.
- Dead Click: clique uma unica vez em `Aplicar cupom de 30%` e aguarde pelo menos 2 segundos. O botao nao altera o DOM, nao inicia rede e nao navega. Nao clique repetidamente, pois isso tambem poderia gerar Rage Click.
- Error Click: clique uma vez em `Calcular frete expresso`. O handler altera o estado visual e chama `datadogRum.addError()` por meio de `captureRumError`, fazendo o erro ficar associado a action automatica sem derrubar a pagina.

No RUM Explorer, selecione `Actions`, filtre por `service:tea-shop-demo`, `env:local` e pela view `Frustration Signals Lab`, e use uma consulta por vez:

```text
@action.frustration.type:rage_click
@action.frustration.type:dead_click
@action.frustration.type:error_click
```

Os nomes esperados das actions sao:

- `Frustration Lab - Rage Click`
- `Frustration Lab - Dead Click`
- `Frustration Lab - Error Click`

O SDK somente conclui a cadeia de cliques depois de aguardar novos cliques. Por isso, espere alguns segundos antes de atualizar o RUM Explorer. A mesma sessao tambem pode ser aberta no Session Replay para mostrar o sinal na linha do tempo.

## Controlar o bot

Variaveis no `.env`:

```bash
FRONTEND_URL=http://frontend:5173
BOT_CONCURRENCY=3
BOT_HEADLESS=true
BOT_MIN_DELAY_MS=300
BOT_MAX_DELAY_MS=3000
```

Perfis de jornada:

- Comprador feliz: busca produto, adiciona ao carrinho e conclui checkout.
- Usuario indeciso: navega, filtra, abre detalhes e abandona.
- Usuario com erro: tenta checkout com pagamento recusado.
- Usuario de suporte: abre suporte e envia formulario.
- Usuario explorador: navega varias paginas, faz scroll e acessa produto inexistente.

Cada sessao usa um contexto limpo do navegador. O bot passa usuario fake por query string na primeira pagina; o frontend chama `datadogRum.setUser()` e registra a action `synthetic_user_started`.

## Verificar no Datadog

Depois de subir com `.env` configurado, aguarde alguns minutos e abra:

- RUM Explorer
- Sessions
- Views
- Actions
- Resources
- Errors
- Session Replay

Procure pelo service `tea-shop-demo` e env `local`. As sessoes do bot devem mostrar navegacao entre paginas, cliques, formularios, scrolls, chamadas para `localhost:3000` ou `backend:3000`, actions customizadas e erros controlados.

## Backend

Endpoints:

- `GET /health`
- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/cart/validate`
- `POST /api/checkout`
- `POST /api/support`

A API usa dados em memoria, CORS aberto para a demo, latencia aleatoria entre 100ms e 1500ms, e uma pequena taxa de falhas controladas.
