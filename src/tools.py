import math

from langchain_core.tools import tool
from langchain_tavily import TavilySearch

from src.database import save_memory, search_memory
from src.rag import retrive_from_rag
from src.config import Settings
from utils.custom_exception import CustomException
from utils.logger import logger



CURRENT_THREAD_ID = "default"

def set_current_thread_id(thread_id : str):

    global CURRENT_THREAD_ID
    CURRENT_THREAD_ID = thread_id


web_search = TavilySearch(
    max_results = 5,
    topic = "general",
    search_depth = "advanced"
)


@tool
def calculator(expression : str) -> str:
    """
    Useful for simple math calculations.
    Input should be a valid math expression.
    Example: 2 + 2, math.sqrt(16), 10 * 5
    """

    try:
        allowed = {
            "math": math,
            "abs": abs,
            "round": round,
            "min": min,
            "max": max,
            "sum": sum
        }

        results = eval(expression, {"__builtins__" : {}}, allowed)
        return str(results)

    
    except Exception as e:
        logger.error(f"Error while doing calculation : {e}")
        raise CustomException("Failed to do calculation : ", e)
    


@tool
def search_uploaded_documents(query : str) -> str:
    """
    Search uploaded documents for relevant information.
    Use this when the user asks about uploaded PDFs, DOCX, TXT, notes, files, or documents.
    """

    return retrive_from_rag(
        query = query,
        thread_id = CURRENT_THREAD_ID
    )
    


@tool
def remember_this(memory : str) -> str:
    """
    Save an important user preference or fact into long-term memory.
    Use this when the user asks you to remember something.
    """

    return save_memory(
        thread_id = CURRENT_THREAD_ID,
        memory = memory
    )




@tool
def recall_memory(query : str) -> str:
    """
    Recall saved long-term memories about the user or this conversation.
    """

    return search_memory(
        thread_id = CURRENT_THREAD_ID,
        query = query
    )




tools = [
    calculator,
    search_uploaded_documents,
    remember_this,
    recall_memory,
    web_search
]