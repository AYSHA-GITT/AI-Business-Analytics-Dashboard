from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from app.services.data_store import get_dataframe
from app.services.forecast_service import generate_forecast

router = APIRouter()


class SimulateRequest(BaseModel):
    growth_adjustment_pct: float  # e.g. 10 means +10%, -15 means -15%


@router.post("/simulate")
async def simulate_scenario(request: SimulateRequest):
    df, filename = get_dataframe()

    if df is None:
        raise HTTPException(status_code=400, detail="No data uploaded yet. Please upload a file first.")

    # Find date and revenue-like column the same way upload.py does
    from app.services.column_detector import detect_column_types
    column_info = detect_column_types(df)

    date_col = next((col for col, info in column_info.items() if info["detected_type"] == "date"), None)
    priority_keywords = ["revenue", "sales", "amount", "price", "total"]
    number_cols = [col for col, info in column_info.items() if info["detected_type"] == "number"]
    number_col = next(
        (col for col in number_cols if any(k in col.lower() for k in priority_keywords)),
        number_cols[0] if number_cols else None
    )

    if not date_col or not number_col:
        raise HTTPException(status_code=400, detail="Could not find date/revenue columns for simulation.")

    base_forecast = generate_forecast(df, date_col, number_col, periods=30)

    if "error" in base_forecast:
        raise HTTPException(status_code=400, detail=base_forecast["error"])

    multiplier = 1 + (request.growth_adjustment_pct / 100)

    adjusted_forecast = [
        {
            "date": row["date"],
            "predicted": round(row["predicted"] * multiplier, 2),
            "lower_bound": round(row["lower_bound"] * multiplier, 2),
            "upper_bound": round(row["upper_bound"] * multiplier, 2),
        }
        for row in base_forecast["forecast"]
    ]

    base_total = sum(row["predicted"] for row in base_forecast["forecast"])
    adjusted_total = sum(row["predicted"] for row in adjusted_forecast)

    return {
        "historical": base_forecast["historical"],
        "base_forecast": base_forecast["forecast"],
        "adjusted_forecast": adjusted_forecast,
        "base_total_30d": round(base_total, 2),
        "adjusted_total_30d": round(adjusted_total, 2),
        "difference": round(adjusted_total - base_total, 2),
        "growth_adjustment_pct": request.growth_adjustment_pct,
    }