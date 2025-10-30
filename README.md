# Bonfire

Um espaço simples para compartilhar relatos ao redor de uma fogueira virtual, com som ambiente opcional. A tela principal mostra uma fogueira animada; você pode escrever como foi seu dia e ler relatos de outras pessoas.

## Como rodar localmente

Pré-requisitos:
- Node.js 18+ (recomendado)

Passos (Windows PowerShell):

```powershell
npm install
npm run dev
# Abra http://localhost:3000
```

Para rodar em modo normal:

```powershell
npm start
```

## Estrutura

- `server.js` – Servidor Express que serve os arquivos estáticos e a API `/api`.
- `public/` – Frontend estático (HTML, CSS, JS) com a animação da fogueira.
- `data/posts.json` – Armazena os relatos enviados (JSON simples).

## API

- `GET /api/posts?limit=50` – Retorna os últimos relatos (mais recentes primeiro). `limit` padrão 50 (máx. 200).
- `POST /api/posts` – Cria um novo relato.
	- Body: `{ "text": string }` (3 a 1000 caracteres)

Observação: a API não tem autenticação. É um protótipo para uso local ou laboratório.

## Áudio ambiente

Coloque um arquivo MP3 de som de fogueira em `public/assets/audio/bonfire-ambience.mp3` (ex.: som ambiente de fogueira com licença livre). Sem o arquivo, o botão exibirá "Som indisponível".

## Roadmap (ideias)

- Moderação básica (limitar frequência por cliente, filtros simples)
- Persistência mais robusta (SQLite/Prisma ou outro DB)
- Modo noite/dia, temas e acessibilidade (contraste e teclas de atalho)
- Realtime (SSE/WebSocket) para feed ao vivo

---

Feito com ❤️ para momentos de pausa ao redor da fogueira.