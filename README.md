# FakeGPT

FakeGPT is an open-source agentic AI chatbot built with Python, FastAPI, LangGraph, LangChain, Google Gemini, Tavily, ChromaDB, and SQLite.

It supports real-time streaming chat, document uploads, retrieval-augmented generation (RAG), web search, conversation memory, and a polished web interface.

## Features

- Chat with an AI agent powered by Google Gemini
- Stream responses in real time
- Upload PDF, DOCX, TXT, Markdown, Python, and CSV files
- Query uploaded files through retrieval-augmented generation (RAG)
- Search the web with Tavily for current information
- Store and recall conversation history
- Choose from supported Gemini models in the web interface
- Run locally or in Docker
- Includes a foundation for AWS CI/CD with GitHub Actions, ECR, and EC2

## Project overview

| Component | Purpose |
| --- | --- |
| FastAPI | Backend server and API endpoints |
| Jinja2 + Tailwind CSS | Responsive web interface |
| LangGraph | Agent orchestration |
| LangChain | Tools, messages, and RAG workflow |
| Google Gemini | Large language model provider |
| Tavily | Web search for current information |
| ChromaDB | Vector search over uploaded documents |
| SQLite | Conversation history and persistence |
| Docker | Containerized deployment |

## Prerequisites

- Python 3.11 or newer
- `pip` or Conda
- Git
- A Google Gemini API key
- A Tavily API key for web search

Optional deployment requirements:

- Docker
- An AWS account
- An Amazon ECR repository
- An EC2 instance
- A GitHub Actions self-hosted runner

## Getting started

### 1. Clone the repository

```bash
git clone https://github.com/Sumit-Prasad01/FakeGPT.git
cd FakeGPT
```

### 2. Create and activate a virtual environment

Using Conda:

```bash
conda create -n fakegpt python=3.11 -y
conda activate fakegpt
```

Or using Python's built-in virtual environment:

```bash
python -m venv .venv
```

On Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

On macOS or Linux:

```bash
source .venv/bin/activate
```

### 3. Install dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure environment variables

Create a `.env` file in the project root:

```env
GOOGLE_API_KEY=your_google_api_key
GOOGLE_MODEL=gemini-2.5-flash

TAVILY_API_KEY=your_tavily_api_key

LANGSMITH_TRACING=false
LANGSMITH_ENDPOINT=https://api.smith.langchain.com
LANGSMITH_API_KEY=your_langsmith_api_key
LANGSMITH_PROJECT=fakegpt
```

`GOOGLE_API_KEY` and `TAVILY_API_KEY` are required for Gemini chat and web-search features. LangSmith settings are optional and can be omitted when tracing is not needed.

### 5. Run the application

```bash
python app.py
```

Open [http://127.0.0.1:8000](http://127.0.0.1:8000) in your browser.

## Docker

Build and run FakeGPT with Docker:

```bash
docker build -t fakegpt .
docker run --env-file .env -p 8080:8080 fakegpt
```

Then open [http://127.0.0.1:8080](http://127.0.0.1:8080).

## Supported document types

FakeGPT accepts `.pdf`, `.docx`, `.txt`, `.md`, `.py`, and `.csv` documents. After upload, ask questions or request summaries using the document as context.

## License

This project is open source. Add a license file to define the terms for reuse and distribution.
