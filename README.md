<p align="center">
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=flat-square&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Ink-5.1-FF6B6B?style=flat-square&logoColor=white" alt="Ink" />
  <img src="https://img.shields.io/badge/License-MIT-e8873a?style=flat-square" alt="License" />
  <img src="https://img.shields.io/badge/Version-1.0.0-444444?style=flat-square" alt="Version" />
</p>

<h1 align="center">🐕 OpenShiba</h1>

<p align="center">
  <strong>CLI interativa sênior para conversar com modelos de IA — open-source, local-first</strong><br/>
  Interface de terminal bonita com streaming em tempo real, 7 providers, 22 comandos slash e mascote Shiba Inu.
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Providers-7-e8873a?style=for-the-badge" alt="Providers" />
  <img src="https://img.shields.io/badge/Commands-22-e8873a?style=for-the-badge" alt="Commands" />
  <img src="https://img.shields.io/badge/Platforms-Windows%20%7C%20macOS%20%7C%20Linux-e8873a?style=for-the-badge" alt="Platforms" />
</p>

---

## ✨ Preview

```
╔══════════════════════════════════════════╗
  ║        🐕 OpenShiba v1.0.0              ║
  ║  The Open-Source AI Terminal Companion ║
  ╚══════════════════════════════════════════╝

    ___  ____  _____ _   _ ____  _   _ ___ ____    _
   / _ \|  _ \| ____| \ | / ___|| | | |_ _| __ )  / \
  | | | | |_) |  _| |  \| \___ \| |_| || ||  _ \ / _ \
  | |_| |  __/| |___| |\  |___) |  _  || || |_) / ___ \
   \___/|_|   |_____|_| \_|____/|_| |_|___|____/_/   \_\

 ┌─ Status ────────────────────────────────────────┐
 ├─ Provider  ── OpenRouter
 ├─ Model     ── claude-sonnet-4
 ├─ Endpoint  ── https://openrouter.ai/api/v1
 └─ Profile   ── default
 └─ Status     ── ● Connected

[You] Explique computação quântica em 3 linhas
[AI] Computação quântica usa qubits que podem
     estar em superposição (0 e 1 ao mesmo tempo),
     permitindo processamento paralelo exponencial...
     tokens: 847 (prompt: 24, completion: 823)

> █
────────────────────────────────────────────────
Tokens: 1.2k / 200k (1%)                     ● Connected
openshiba v1.0.0
```

---

## 🚀 Instalação Rápida

### Pré-requisitos

- **Node.js 18+** — [baixe aqui](https://nodejs.org)
- npm (já vem com o Node.js)

### Instalar

```bash
# Clone o repositório
git clone https://github.com/Eliene-byte/openshiba.git
cd openshiba

# Instale as dependências
npm install

# Compile o TypeScript
npm run build

# Instale globalmente (opcional)
npm install -g .

# Rode!
openshiba
```

### Sem instalar globalmente

```bash
npx openshiba
# ou
node dist/cli/index.js
```

---

## 🤖 Providers Suportados

| Provider | Endpoint | API Key | Local |
|----------|----------|---------|-------|
| **OpenRouter** | `https://openrouter.ai/api/v1` | ✅ Necessária | ❌ |
| **OpenAI** | `https://api.openai.com/v1` | ✅ Necessária | ❌ |
| **Anthropic** | SDK nativo | ✅ Necessária | ❌ |
| **Groq** | `https://api.groq.com/openai/v1` | ✅ Necessária | ❌ |
| **Ollama** | `http://localhost:11434` | ❌ Não precisa | ✅ |
| **LM Studio** | `http://localhost:1234/v1` | ❌ Não precisa | ✅ |
| **Custom** | Configurável | Opcional | Opcional |

### Configurar Provider

```
/provider openrouter
/key sk-or-v1-sua-api-key-aqui
/model openai/gpt-4o-mini
```

### Usar Ollama (local, grátis)

1. Instale o [Ollama](https://ollama.com)
2. Baixe um modelo: `ollama pull llama3.3`
3. Deixe o Ollama rodando e abra o OpenShiba

```
/provider ollama
/model llama3.3
```

---

## 📋 Comandos Slash

| Comando | Descrição |
|---------|-----------|
| `/help` | Lista todos os comandos |
| `/provider` | Troca o provider ativo |
| `/model` | Troca o modelo ativo |
| `/key` | Define ou atualiza a API key |
| `/config` | Edita configurações (temp, top_p, max_tokens) |
| `/system` | Define o system prompt da sessão |
| `/clear` | Limpa o histórico da conversa |
| `/reset` | Reinicia tudo (provider, model, histórico) |
| `/history` | Lista conversas salvas |
| `/load` | Carrega uma conversa anterior |
| `/save` | Salva a conversa com nome customizado |
| `/export` | Exporta conversa como `.md` ou `.json` |
| `/copy` | Copia a última resposta para o clipboard |
| `/tokens` | Mostra uso de tokens da sessão |
| `/stream` | Toggle de streaming on/off |
| `/multiline` | Modo de input multilinha |
| `/attach` | Anexa arquivo ao contexto (RAG simples) |
| `/diff` | Compara duas respostas lado a lado |
| `/run` | Executa um arquivo `.shibaprompt` |
| `/whoami` | Exibe o Shiba + info do provider |
| `/pipe` | Lê stdin como contexto |
| `/exit` | Encerra o OpenShiba |

---

## ⚡ Funcionalidades

### Streaming em Tempo Real
Tokens aparecem conforme chegam, com cursor piscante e diff highlight para código gerado.

### Syntax Highlight no Terminal
Blocos de código com 50+ linguagens suportadas, renderizados com cores no terminal.

### Histórico Persistente
Conversas salvas em `~/.openshiba/history/` com busca full-text:

```
/history search "quantum"
```

### Pipe Mode
Integração com scripts shell:

```bash
echo "Resuma este texto" | openshiba
cat arquivo.txt | openshiba
```

### Profiles
Múltiplos perfis de configuração:

```bash
openshiba --profile trabalho
openshiba --profile pessoal
```

### .shibaprompt Files
Arquivos de prompt reutilizáveis com variáveis:

```markdown
Revise o seguinte código:
{{file}}
Data: {{date}}
```

```bash
/run meu-prompt.shibaprompt
```

### Token Budget
Alerta visual quando a conversa se aproxima do limite de contexto (verde → amarelo → vermelho).

### RAG Simples
Anexe arquivos ao contexto:

```
/attach path/to/documento.txt
```

### Retry Inteligente
Reenvio automático com backoff exponencial em caso de rate limit ou timeout.

---

## 🛠️ Stack Tecnológica

| Tecnologia | Uso |
|------------|-----|
| **Node.js + TypeScript** | Runtime e linguagem principal |
| **Ink (React para Terminal)** | Renderização TUI |
| **OpenAI SDK** | Providers OpenAI-compatíveis |
| **@anthropic-ai/sdk** | Provider Anthropic nativo |
| **Groq SDK** | Inferência ultrarrápida |
| **Ollama SDK** | Modelos locais |
| **sql.js** | Banco SQLite (puro JS, sem compilação) |
| **figlet + chalk** | ASCII art e cores |
| **marked** | Renderização markdown |
| **Commander.js** | Parser de argumentos CLI |
| **clipboardy** | Integração com clipboard |

---

## 📁 Estrutura do Projeto

```
openshiba/
├── src/
│   ├── cli/
│   │   ├── index.ts              ← Entry point (arg parser)
│   │   ├── repl.tsx              ← REPL interativo com Ink
│   │   └── commands/             ← 22 comandos slash
│   │       ├── index.ts
│   │       ├── help.ts, model.ts, provider.ts
│   │       ├── save.ts, load.ts, export.ts
│   │       └── ...
│   ├── providers/
│   │   ├── base.ts               ← Factory createProvider()
│   │   ├── openrouter.ts
│   │   ├── anthropic.ts
│   │   ├── groq.ts
│   │   ├── ollama.ts
│   │   ├── openai.ts
│   │   └── custom.ts
│   ├── ui/
│   │   ├── header.tsx            ← ASCII art + infobox
│   │   ├── message.tsx           ← Bolhas de mensagem
│   │   ├── statusbar.tsx         ← Rodapé com tokens/status
│   │   ├── spinner.tsx           ← Spinner animado
│   │   └── shiba.tsx             ← Mascote Shiba Inu
│   ├── storage/
│   │   ├── config.ts             ← ConfigStore (conf)
│   │   └── history.ts            ← HistoryStore (sql.js)
│   └── utils/
│       ├── tokenizer.ts          ← Estimativa de tokens
│       ├── markdown.ts           ← Render markdown → ANSI
│       └── rag.ts                ← Chunking + attach
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🖥️ Compatibilidade

| Plataforma | Status |
|------------|--------|
| Windows 10/11 | ✅ |
| macOS (Intel/Apple Silicon) | ✅ |
| Linux (Ubuntu, Debian, Arch...) | ✅ |
| WSL (Windows Subsystem for Linux) | ✅ |

---

## 🎯 Flags da CLI

```bash
openshiba                              # Abre com perfil default
openshiba --profile trabalho            # Perfil específico
openshiba --provider openai             # Provider direto
openshiba --model gpt-4o               # Modelo direto
openshiba --debug                      # Ativa debug log
openshiba --run prompt.shibaprompt     # Executa arquivo de prompt
echo "Oi" | openshiba --pipe           # Modo pipe
```

---

## 🐕 Sobre o Projeto

OpenShiba é um projeto open-source inspirado no [OpenClaude](https://github.com/ryouha/claude-code-term), construído do zero com TypeScript, Ink e React para terminal. O nome vem da raça Shiba Inu — leal, ágil e determinado.

### Diferenciais

- **100% open-source** — sem dependências proprietárias
- **Local-first** — funciona offline com Ollama
- **Multi-provider** — 7 providers em uma interface única
- **Zero compilação C++** — sql.js puro JavaScript (funciona em qualquer OS sem Visual Studio)
- **TypeScript strict** — código tipado, seguro e manutenível

---

## 📄 Licença

MIT — use, modifique e distribua livremente.

---

</p>
