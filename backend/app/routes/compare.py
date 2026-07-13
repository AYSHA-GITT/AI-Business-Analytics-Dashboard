from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import pandas as pd
import io
from app.services.column_detector import detect_column_types
from app.services.comparison_service import compare_datasets

router = APIRouter()


def _read_file(file: UploadFile, contents: bytes) -> pd.DataFrame:
    if file.filename.endswith(".csv"):
        return pd.read_csv(io.BytesIO(contents))
    elif file.filename.endswith(".xlsx"):
        return pd.read_excel(io.BytesIO(contents))
    else:
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported")


@router.post("/compare")
async def compare_files(
    file_a: UploadFile = File(...),
    file_b: UploadFile = File(...),
    label_a: str = Form("Dataset A"),
    label_b: str = Form("Dataset B"),
):
    contents_a = await file_a.read()
    contents_b = await file_b.read()

    df_a = _read_file(file_a, contents_a)
    df_b = _read_file(file_b, contents_b)

    column_info_a = detect_column_types(df_a)

    priority_keywords = ["revenue", "sales", "amount", "price", "total"]
    number_cols_a = [col for col, info in column_info_a.items() if info["detected_type"] == "number"]
    number_col = next(
        (col for col in number_cols_a if any(k in col.lower() for k in priority_keywords)),
        number_cols_a[0] if number_cols_a else None
    )

    category_cols_a = [col for col, info in column_info_a.items() if info["detected_type"] == "category"]
    category_col = category_cols_a[0] if category_cols_a else None

    if not number_col or number_col not in df_b.columns:
        raise HTTPException(status_code=400, detail="Could not find a matching numeric column in both files.")

    result = compare_datasets(df_a, df_b, label_a, label_b, number_col, category_col)
    result["number_col"] = number_col
    result["category_col"] = category_col

    return result