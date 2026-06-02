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
- Session Replay: https://docs.datadoghq.com/session_replay/browser/

## O que a demo contem

Rotas reais:

- `/`
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

As views sao iniciadas manualmente a cada troca de rota do React Router. O projeto tambem envia actions customizadas:

- `product_added_to_cart`
- `checkout_started`
- `checkout_completed`
- `support_ticket_submitted`

O SDK v6 inicia Session Replay automaticamente quando a sessao entra na amostra de replay. Por isso a demo usa `sessionReplaySampleRate: 100` e nao chama `startSessionReplayRecording()` manualmente.

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
