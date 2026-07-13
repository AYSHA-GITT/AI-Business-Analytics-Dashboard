from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.data_store import get_dataframe
from app.services.custom_metric_service import calculate_custom_metric
import pandas as pd

router = APIRouter()


class CustomMetricRequest(BaseModel):
    formula: str


@router.post("/custom-metric")
async def custom_metric(request: CustomMetricRequest):
    df, filename = get_dataframe()

    if df is None:
        raise HTTPException(status_code=400, detail="No data uploaded yet. Please upload a file first.")

    numeric_columns = [col for col in df.columns if pd.api.types.is_numeric_dtype(df[col])]

    result = calculate_custom_metric(df, request.formula, numeric_columns)
    return result