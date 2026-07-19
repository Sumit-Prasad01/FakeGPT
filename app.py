import json 
import uuid 
import uvicorn

from pathlib import Path

from fastapi import FastAPI, Request, UploadFile, File, Form
from fastapi.responses import StreamingResponse, JSONResponse
from fastapi.templating import Jinja2Templates

from langchain_core.messages import (
    HumanMessage,
    AIMessage,
    AIMessageChunk,
    ToolMessage
)

from src.agent import get_agent
from src.database import (
    init_db,
    save_chat_message,
    get_chat_history,
    create_or_update_conversation,
    list_conversation
)

from src.rag import add_document_to_rag
from src.tools import set_current_thread_id



app = FastAPI()

templates =  Jinja2Templates(directory = "templates")

Path("uploads").mkdir(exist_ok = True)
Path("data").mkdir(exist_ok = True)

init_db()


@app.get("/")
async def home(request : Request):
    return templates.TemplateResponse(
        request = request,
        name = "index.html",
        context = {}
    )

@app.get("/health")
async def check_health():
    return {
        "health" : "All Good!"
    }