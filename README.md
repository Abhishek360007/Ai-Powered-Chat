# Nova · AI-Powered Chat

A full-stack AI chat assistant with real-time streaming replies, conversation memory and a modern, responsive UI.
It is built with **Spring Boot 4 + Spring AI 2** on the backend and **React 19 + Vite** on the frontend, and it runs with one Docker Compose command.

## Features

- **Streaming responses**: tokens appear as the model generates them (NDJSON stream).
- **Conversation memory**: the assistant remembers earlier messages in each chat.
- **Multiple chats**: a sidebar keeps your history, saved in the browser across reloads.
- **Rich Markdown**: tables, lists and code blocks, with a copy button on each code block.
- **Stop & retry**: cancel a reply mid-stream, or retry one that failed.
- **Dark / light theme**: follows your system setting by default, and you can switch it.
- **Responsive**: works on desktop and mobile.
- **Production-ready backend**: request validation, consistent JSON errors, health checks, virtual threads and a non-root Docker image.

## Tech stack

| Layer    | Technology                                                       |
| -------- | ---------------------------------------------------------------- |
| Backend  | Java 25, Spring Boot 4.2, Spring AI 2.1 (OpenAI), Spring Actuator |
| Frontend | React 19, Vite 8, react-markdown + GFM, react-icons               |
| DevOps   | Docker (multi-stage builds), Docker Compose, Nginx, GitHub Actions |

## Architecture

```
Browser ──► Nginx (frontend container, :3000)
              ├── /        → React static build
              └── /api/*   → Spring Boot (backend container, :8080) ──► OpenAI API
```

## Quick start (Docker)

```bash
git clone https://github.com/Abhishek360007/Ai-Powered-Chat.git
cd Ai-Powered-Chat
cp .env.example .env          # then put your OpenAI API key in .env
docker compose up --build
```

Open **http://localhost:3000**.

## Running locally (without Docker)

**Backend** (requires JDK 25):

```bash
cd backend
export OPENAI_API_KEY=sk-...      # PowerShell: $env:OPENAI_API_KEY="sk-..."
./mvnw spring-boot:run
```

**Frontend** (requires Node 20.19+):

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173**. The Vite dev server forwards `/api` calls to `http://localhost:8080`.
If your backend runs on another port, set `API_PROXY_TARGET`, for example `API_PROXY_TARGET=http://localhost:8095 npm run dev`.

## Configuration

| Variable               | Default                                       | Description                              |
| ---------------------- | --------------------------------------------- | ---------------------------------------- |
| `OPENAI_API_KEY`       | (required)                                    | Your OpenAI API key                      |
| `OPENAI_MODEL`         | `gpt-4o-mini`                                 | Chat model to use                        |
| `OPENAI_TEMPERATURE`   | `0.7`                                         | Creativity of replies (0 to 2)           |
| `CHAT_MEMORY_WINDOW`   | `20`                                          | Messages remembered per conversation     |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:3000` | Comma-separated list of allowed origins  |
| `PORT`                 | `8080`                                        | Backend port                             |

The assistant's personality is set by `app.chat.system-prompt` in [`application.yaml`](backend/src/main/resources/application.yaml).

## API

| Method   | Endpoint                 | Description                                    |
| -------- | ------------------------ | ---------------------------------------------- |
| `POST`   | `/api/chat`              | Returns the full reply as JSON                 |
| `POST`   | `/api/chat/stream`       | Streams the reply as newline-delimited JSON    |
| `DELETE` | `/api/chat/{id}`         | Clears the memory of a conversation            |
| `GET`    | `/actuator/health`       | Health check                                   |

Request body:

```json
{ "message": "Explain virtual threads", "conversationId": "optional-id" }
```

Response from `POST /api/chat`:

```json
{ "conversationId": "3f0c…", "reply": "Virtual threads are…", "timestamp": "2026-11-25T10:00:00Z" }
```

Each line from `POST /api/chat/stream`:

```json
{"conversationId":"3f0c…","content":"Virtual","done":false,"error":null}
```

## Project structure

```
Ai-Powered-Chat/
├── backend/                 Spring Boot API
│   └── src/main/java/com/abhishek/aichat/
│       ├── config/          ChatClient, memory, CORS, properties
│       ├── controller/      REST endpoints
│       ├── service/         Chat logic (call + stream)
│       ├── dto/             Request / response records
│       └── exception/       Global error handling
├── frontend/                React + Vite UI
│   └── src/
│       ├── components/      Sidebar, MessageList, Message, Composer
│       ├── api.js           Streaming client
│       └── useConversations.js
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Tests

```bash
cd backend && ./mvnw test
```

## License

Apache License 2.0. See [LICENSE](LICENSE) and [NOTICE](NOTICE).
