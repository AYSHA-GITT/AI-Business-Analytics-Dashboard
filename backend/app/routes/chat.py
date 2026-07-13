from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.data_store import get_dataframe
from app.services.chat_service import answer_question

router = APIRouter()


class ChatRequest(BaseModel):
    question: str


@router.post("/chat")
async def chat_with_data(request: ChatRequest):
    df, filename = get_dataframe()

    if df is None:
        raise HTTPException(status_code=400, detail="No data uploaded yet. Please upload a file first.")

    result = answer_question(request.question, df)
    return result