import os
import uuid
import pandas as pd
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from pydantic import BaseModel
from app.tasks import process_upload_task
from app.celery_app import celery_app
from app.services.data_store import store_dataframe

router = APIRouter()

UPLOAD_DIR = "temp_uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload-async")
async def upload_file_async(file: UploadFile = File(...), mode: str = Form("sales"), user_email: str = Form(None)):
    if not file.filename.endswith((".csv", ".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported")

    contents = await file.read()
    temp_filename = f"{uuid.uuid4()}_{file.filename}"
    temp_path = os.path.join(UPLOAD_DIR, temp_filename)

    with open(temp_path, "wb") as f:
        f.write(contents)

    task = process_upload_task.delay(temp_path, file.filename, mode, user_email)

    return {"task_id": task.id, "status": "queued"}

@router.get("/task-status/{task_id}")
async def get_task_status(task_id: str):
    task_result = celery_app.AsyncResult(task_id)

    if task_result.state == "PENDING":
        return {"state": "PENDING", "step": "waiting to start"}
    elif task_result.state == "PROCESSING":
        return {"state": "PROCESSING", "step": task_result.info.get("step", "")}
    elif task_result.state == "SUCCESS":
        return {"state": "SUCCESS", "result": task_result.result}
    elif task_result.state == "FAILURE":
        return {"state": "FAILURE", "error": str(task_result.info)}
    else:
        return {"state": task_result.state}


class ActivateRequest(BaseModel):
    temp_path: str
    filename: str


@router.post("/activate-dataset")
async def activate_dataset(request: ActivateRequest):
    if request.filename.endswith(".csv"):
        df = pd.read_csv(request.temp_path)
    else:
        df = pd.read_excel(request.temp_path)

    store_dataframe(df, request.filename)
    return {"status": "activated"}