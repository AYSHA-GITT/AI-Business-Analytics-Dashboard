from fastapi import APIRouter, UploadFile, File, Form, HTTPException
import pandas as pd
import io
from app.services.column_detector import detect_column_types
from app.services.forecast_service import generate_forecast
from app.services.anomaly_service import detect_anomalies
from app.services.quality_service import check_data_quality
from app.services.data_store import store_dataframe
from app.services.mode_insights_service import generate_mode_insights

router = APIRouter()

@router.post("/upload")
async def upload_file(file: UploadFile = File(...), mode: str = Form("sales")):
    if not file.filename.endswith((".csv", ".xlsx")):
        raise HTTPException(status_code=400, detail="Only CSV or Excel files are supported")

    contents = await file.read()

    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(contents))
        else:
            df = pd.read_excel(io.BytesIO(contents))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not read file: {str(e)}")

    store_dataframe(df, file.filename)

    column_info = detect_column_types(df)
    quality_report = check_data_quality(df, column_info)

    date_col = next((col for col, info in column_info.items() if info["detected_type"] == "date"), None)

    priority_keywords = ["revenue", "sales", "amount", "price", "total"]
    number_cols = [col for col, info in column_info.items() if info["detected_type"] == "number"]
    number_col = next(
        (col for col in number_cols if any(keyword in col.lower() for keyword in priority_keywords)),
        number_cols[0] if number_cols else None
    )

    category_cols = [col for col, info in column_info.items() if info["detected_type"] == "category"]

    forecast_result = None
    anomaly_result = []

    if date_col and number_col:
        forecast_result = generate_forecast(df, date_col, number_col, periods=30)
        anomaly_result = detect_anomalies(df, date_col, number_col, category_cols)

    mode_insights = generate_mode_insights(mode, df, column_info) if mode != "sales" else None

    return {
        "filename": file.filename,
        "mode": mode,
        "rows": len(df),
        "columns": len(df.columns),
        "column_info": column_info,
        "quality_report": quality_report,
        "preview": df.head(5).to_dict(orient="records"),
        "forecast_data": forecast_result,
        "anomalies": anomaly_result,
        "mode_insights": mode_insights,
        "date_col": date_col,
        "number_col": number_col,
    }