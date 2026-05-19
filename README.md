# YARI IA GLPI Backend

Plataforma YARI IA GLPI: integração WhatsApp WAHA, IA Groq, GLPI, PostgreSQL, Redis e Docker.

## Visão geral

- Recebe mensagens do WhatsApp via WAHA
- Interpreta texto com IA Groq
- Cria e atualiza tickets no GLPI
- Responde automaticamente os usuários
- Escala tickets críticos
- Registra histórico em PostgreSQL
- Implementa segurança com JWT, Helmet, Rate Limit e validação

## Estrutura do projeto

```
backend/
 ├── src/
 │   ├── app.js
 │   ├── server.js
 │   ├── config/
 │   ├── routes/
 │   ├── controllers/
 │   ├── services/
 │   ├── middlewares/
 │   ├── database/
 │   ├── utils/
 │   ├── jobs/
 │   ├── ai/
 │   └── integrations/
 ├── prisma/
 ├── docker/
 ├── .env
 ├── docker-compose.yml
 ├── package.json
 └── README.md
```

## Requisitos

- Node.js >= 18
- Docker
- Docker Compose
- PostgreSQL
- Redis

## Configuração

1. Copie `.env` e atualize as variáveis de ambiente.
2. Execute no diretório `backend`:
   ```bash
   npm install
   npx prisma generate
   npx prisma migrate dev --name init
   npm run seed
   npm run dev
   ```
3. Para rodar com Docker:
   ```bash
   docker compose up --build
   ```

## Variáveis de ambiente obrigatórias

```env
PORT=3000
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
GROQ_API_KEY=
WAHA_API_URL=http://201.55.31.124:3001
WAHA_API_KEY=YARI123
GLPI_URL=
GLPI_APP_TOKEN=
GLPI_USER_TOKEN=
```

## Endpoints principais

- `POST /webhook` - recebe mensagens WhatsApp do WAHA
- `POST /auth/login` - autentica usuários
- `GET /tickets` - lista tickets
- `GET /tickets/:id` - consulta ticket
- `POST /tickets/:id/escalate` - escalar ticket

## Exemplo de Webhook WAHA

```json
{
  "chatId": "5511999999999@c.us",
  "text": "Preciso abrir um chamado para suporte de rede."
}
```

## Exemplo de resposta do webhook

```json
{
  "status": "success",
  "message": "Ticket criado no GLPI e resposta enviada via WhatsApp"
}
```

## Segurança

- Helmet
- CORS restrito
- Rate limit global
- JWT Authentication
- Joi validation
- sanitize-html para conteúdo de mensagens
- Logs estruturados com Winston

## Postman

Crie requests para os endpoints acima. Use `Authorization: Bearer <token>` para rotas protegidas.

## Deploy Railway

- Use Dockerfile e `docker compose` para build local
- Configure variáveis no Railway
- Healthcheck: `/health`
- Start command: `npm start`
