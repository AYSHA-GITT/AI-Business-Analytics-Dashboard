import pandas as pd
from app.celery_app import celery_app
from app.services.column_detector import detect_column_types
from app.services.forecast_service import generate_forecast
from app.services.anomaly_service import detect_anomalies
from app.services.quality_service import check_data_quality
from app.services.mode_insights_service import generate_mode_insights
from app.services.email_service import send_anomaly_alert


@celery_app.task(bind=True)
def process_upload_task(self, file_path: str, filename: str, mode: str = "sales", user_email: str = None):
    self.update_state(state="PROCESSING", meta={"step": "reading file"})

    if filename.endswith(".csv"):
        df = pd.read_csv(file_path)
    else:
        df = pd.read_excel(file_path)

    self.update_state(state="PROCESSING", meta={"step": "detecting columns"})
    column_info = detect_column_types(df)
    quality_report = check_data_quality(df, column_info)

    date_col = next((col for col, info in column_info.items() if info["detected_type"] == "date"), None)
    priority_keywords = ["revenue", "sales", "amount", "price", "total"]
    number_cols = [col for col, info in column_info.items() if info["detected_type"] == "number"]
    number_col = next(
        (col for col in number_cols if any(k in col.lower() for k in priority_keywords)),
        number_cols[0] if number_cols else None
    )
    category_cols = [col for col, info in column_info.items() if info["detected_type"] == "category"]

    forecast_result = None
    anomaly_result = []

    if date_col and number_col:
        self.update_state(state="PROCESSING", meta={"step": "forecasting"})
        forecast_result = generate_forecast(df, date_col, number_col, periods=30)
        self.update_state(state="PROCESSING", meta={"step": "detecting anomalies"})
        anomaly_result = detect_anomalies(df, date_col, number_col, category_cols)

    mode_insights = generate_mode_insights(mode, df, column_info) if mode != "sales" else None

    if anomaly_result and user_email:
        self.update_state(state="PROCESSING", meta={"step": "sending alert email"})
        send_anomaly_alert(user_email, filename, anomaly_result)

    return {
        "filename": filename,
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
        "temp_path": file_path,
    }