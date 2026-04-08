# 🐕 OpenShiba

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-%3E%3D18.0.0-339933?style=flat-square&logo=node.js" alt="Node.js"/>
  <img src="https://img.shields.io/badge/TypeScript-5.7+-3178C6?style=flat-square&logo=typescript" alt="TypeScript"/>
  <img src="https://img.shields.io/badge/Ink-5.x-FF6B00?style=flat-square&logo=react" alt="Ink"/>
  <img src="https://img.shields.io/badge/License-MIT-yellow?style=flat-square" alt="License"/>
  <img src="https://img.shields.io/badge/Platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey?style=flat-square" alt="Platform"/>
</p>

**OpenShiba** é um CLI interativo no terminal para conversar com modelos de IA. Suporta múltiplos providers (OpenRouter, OpenAI, Anthropic, Groq, Ollama, LM Studio e custom), streaming em tempo real, syntax highlighting, histórico de conversas, e muito mais — tudo direto no seu terminal.

```
  ╔════════════════════════════════════════════════════════╗
  ║  ███████╗ ██████╗ ██████╗ ████████╗    ██████╗ ██████╗ ║
  ║  ██╔════╝██╔═══██╗██╔══██╗╚══██╔══╝    ██╔══██╗██╔══██╗║
  ║  ███████╗██║   ██║██████╔╝   ██║       ██████╔╝██████╔╝║
  ║  ╚════██║██║   ██║██╔══██╗   ██║       ██╔══██╗██╔═══╝ ║
  ║  ███████║╚██████╔╝██║  ██║   ██║       ██║  ██║██║     ║
  ║  ╚══════╝ ╚═════╝ ╚═╝  ╚═╝   ╚═╝       ╚═╝  ╚═╝╚═╝     ║
  ║  ███╗   ██╗███████╗████████╗ █████╗ ██╗███╗   ███╗     ║
  ║  ████╗  ██║██╔════╝╚══██╔══╝██╔══██╗██║████╗ ████║     ║
  ║  ██╔██╗ ██║█████╗     ██║   ███████║██║██╔████╔██║     ║
  ║  ██║╚██╗██║██╔══╝     ██║   ██╔══██║██║██║╚██╔╝██║     ║
  ║  ██║ ╚████║███████╗   ██║   ██║  ██║██║██║ ╚═╝ ██║     ║
  ║  ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝  ╚═╝╚═╝╚═╝     ╚═╝     ║
  ╚════════════════════════════════════════════════════════╝
```

---

## ✨ Features

- 🔄 **7 Providers**: OpenRouter, OpenAI, Anthropic, Groq, Ollama, LM Studio, Custom
- 📡 **Streaming em tempo real**: respostas com fluxo contínuo
- 🎨 **Syntax highlighting**: código colorido no terminal
- 📋 **Histórico persistente**: salva conversas com busca
- 🤖 **Listagem de modelos**: `/models` busca modelos em tempo real do provider
- 📦 **Ollama integrado**: mostra modelos baixados e disponíveis para download
- 🔧 **RAG básico**: anexe arquivos como contexto (`/attach`)
- 📊 **Token tracking**: contagem de tokens em tempo real
- 🎭 **ASCII Shiba Inu**: mascote interativo
- ⌨️ **Multiline mode**: mensagens com múltiplas linhas
- 🔁 **Retry com backoff**: 3 tentativas com espera exponencial
- 💾 **Perfis**: múltiplos perfis de configuração
- 📤 **Export**: exporte conversas em Markdown ou JSON

---

## 📦 Instalação

### Pré-requisitos

- **Node.js** 18 ou superior
- **Ollama** (opcional, para modelos locais) — [baixe aqui](https://ollama.com)

### Instalar

```bash
# Clone o repositório
git clone https://github.com/Eliene-byte/openshiba.git
cd openshiba

# Instale as dependências
npm install

# Compile o TypeScript
npm run build

# Rode o OpenShiba
npx openshiba
```

### Instalar globalmente (opcional)

```bash
npm install -g .
openshiba
```

> **Windows**: se `openshiba` não for reconhecido, use `npx openshiba`.

---

## 🚀 Uso Rápido

### Iniciar

```bash
npx openshiba
```

### Configurar provider

```bash
# Para Ollama (local) — já vem configurado por padrão
/provider ollama

# Para OpenRouter
/provider openrouter
/key sk-or-v1-xxxxxxxxxxxx

# Para OpenAI
/provider openai
/key sk-xxxxxxxxxxxx

# Para Anthropic
/provider anthropic
/key sk-ant-xxxxxxxxxxxx

# Para Groq
/provider groq
/key gsk_xxxxxxxxxxxx
```

### Selecionar modelo

```bash
# Lista modelos disponíveis do provider (busca em tempo real)
/models

# Mostra modelos baixados + populares para download (Ollama)
/models

# Seleciona modelo pelo número
/models 3

# Ou diretamente pelo nome
/model qwen2.5
/model gpt-4o
/model anthropic/claude-sonnet-4
```

### Chat

```
> Olá, como você está?
> Me ajude a escrever uma função em Python
> /clear
```

---

## 📋 Comandos

| Comando | Descrição | Exemplo |
|---|---|---|
| `/help` | Lista todos os comandos | `/help` |
| `/models` | Lista modelos do provider (tempo real) | `/models` |
| `/models 3` | Seleciona modelo pelo número | `/models 3` |
| `/model` | Troca modelo pelo nome ou número | `/model qwen2.5` |
| `/list` | Lista modelos disponíveis (live) | `/list` |
| `/provider` | Lista ou troca provider | `/provider openrouter` |
| `/key` | Mostra ou define API key | `/key sk-xxx` |
| `/config` | Mostra ou altera configuração | `/config temperature=0.9` |
| `/system` | Mostra ou define system prompt | `/system Você é um expert` |
| `/clear` | Limpa mensagens da conversa | `/clear` |
| `/reset` | Reseta tudo para o padrão | `/reset` |
| `/history` | Navega no histórico | `/history list` |
| `/load` | Carrega conversa salva | `/load <id>` |
| `/save` | Salva conversa atual | `/save nome` |
| `/export` | Exporta conversa para arquivo | `/export md` |
| `/copy` | Copia última resposta | `/copy` |
| `/tokens` | Mostra uso de tokens | `/tokens` |
| `/stream` | Liga/desliga streaming | `/stream` |
| `/multiline` | Instruções multiline | `/multiline` |
| `/pipe` | Instruções pipe mode | `/pipe` |
| `/run` | Executa arquivo .shibaprompt | `/run file.shiba` |
| `/whoami` | Mostra info da sessão | `/whoami` |
| `/attach` | Anexa arquivo como contexto | `/attach code.py` |
| `/diff` | Compara duas respostas | `/diff` |
| `/exit` | Sai do OpenShiba | `/exit` |

---

## 🤖 Providers Suportados

### Ollama (Local)

Rode modelos localmente sem internet. O comando `/models` mostra:
- ✅ **Modelos baixados**: prontos para usar com tamanho do arquivo
- 📦 **Para baixar**: modelos populares com o comando `ollama pull`

```bash
# Baixe modelos com Ollama
ollama pull llama3.3
ollama pull qwen2.5
ollama pull mistral

# Depois selecione no OpenShiba
/models
/model qwen2.5
```

### OpenRouter

Acesse centenas de modelos via uma API:
```bash
/provider openrouter
/key sk-or-v1-sua-key
/models
```

### OpenAI

```bash
/provider openai
/key sk-sua-key
/models
```

### Anthropic

```bash
/provider anthropic
/key sk-ant-sua-key
/models
```

### Groq

Ultra-rápido com modelos open-source:
```bash
/provider groq
/key gsk_sua-key
/models
```

### LM Studio / Custom

Qualquer endpoint compatível com OpenAI:
```bash
/provider lmstudio
# ou
/provider custom
```

---

## ⚙️ Flags da CLI

```bash
openshiba                    # Inicia com perfil padrão
openshiba --profile dev      # Inicia com perfil "dev"
openshiba --provider groq    # Inicia com provider Groq
openshiba --model llama3.3   # Inicia com modelo específico
openshiba --debug            # Modo debug
openshiba --run file.shiba   # Executa um arquivo .shibaprompt
echo "pergunta" | openshiba --pipe  # Pipe mode
```

---

## 📁 Estrutura

```
openshiba/
├── src/
│   ├── cli/
│   │   ├── index.ts              # Entry point (Commander.js)
│   │   ├── repl.tsx              # REPL principal (Ink + React)
│   │   └── commands/
│   │       ├── index.ts           # Registro de comandos
│   │       ├── models.ts          # /models (busca live)
│   │       ├── model.ts           # /model (troca rápida)
│   │       ├── list.ts            # /list
│   │       ├── provider.ts        # /provider
│   │       ├── key.ts             # /key
│   │       ├── config.ts          # /config
│   │       ├── system.ts          # /system
│   │       ├── help.ts            # /help
│   │       ├── ... (mais 15 comandos)
│   ├── providers/
│   │   ├── base.ts               # Factory de providers
│   │   ├── ollama.ts             # Ollama (local)
│   │   ├── openrouter.ts         # OpenRouter
│   │   ├── openai.ts             # OpenAI
│   │   ├── anthropropic.ts       # Anthropic
│   │   ├── groq.ts               # Groq
│   │   ├── custom.ts             # Custom (qualquer OpenAI-compatível)
│   ├── ui/
│   │   ├── header.tsx             # ASCII art + info
│   │   ├── message.tsx            # Mensagens com markdown
│   │   ├── statusbar.tsx          # Barra de status
│   │   ├── spinner.tsx            # Spinner animado
│   │   └── shiba.tsx              # Mascote ASCII
│   ├── storage/
│   │   ├── config.ts              # Config persistente (conf)
│   │   └── history.ts             # Histórico (sql.js)
│   ├── utils/
│   │   ├── tokenizer.ts           # Estimativa de tokens
│   │   ├── markdown.ts            # Render markdown → ANSI
│   │   └── rag.ts                 # Chunking para /attach
│   └── types.ts                   # Tipos e configs padrão
├── package.json
└── tsconfig.json
```

---

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| [Ink](https://github.com/vadimdemedes/ink) v5 | React para terminal |
| [TypeScript](https://www.typescriptlang.org/) | Tipagem estática |
| [chalk](https://github.com/chalk/chalk) v5 | Cores no terminal |
| [figlet](https://github.com/patorjk/figlet) | ASCII art |
| [sql.js](https://github.com/sql-js/sql.js) | SQLite (pure JS, sem C++) |
| [openai](https://github.com/openai/openai-node) | SDK OpenAI/compatíveis |
| [@anthropic-ai/sdk](https://github.com/anthropics/anthropic-sdk-typescript) | SDK Anthropic |
| [ollama](https://github.com/ollama/ollama-js) | SDK Ollama |
| [marked-terminal](https://github.com/markedjs/marked-terminal) | Markdown no terminal |
| [highlight.js](https://highlightjs.org/) | Syntax highlighting |
| [clipboardy](https://github.com/sindresorhus/clipboardy) | Copiar para clipboard |

---

## 📜 Licença

MIT

---

<p align="center">
  Feito com 🐕 por <a href="https://github.com/Eliene-byte">Eliene-byte</a>
</p>
