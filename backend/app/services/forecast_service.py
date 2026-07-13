import pandas as pd
from prophet import Prophet
import logging

logging.getLogger("cmdstanpy").setLevel(logging.WARNING)


def generate_forecast(df: pd.DataFrame, date_col: str, value_col: str, periods: int = 30) -> dict:
    # Aggregate data by date (sum revenue per day, since multiple rows can share a date)
    daily = df.groupby(date_col)[value_col].sum().reset_index()
    daily.columns = ["ds", "y"]
    daily["ds"] = pd.to_datetime(daily["ds"])
    daily = daily.sort_values("ds")

    if len(daily) < 10:
        return {"error": "Not enough historical data points to forecast reliably (need at least 10 days)."}

    # Train Prophet model
    model = Prophet(
        yearly_seasonality=True,
        weekly_seasonality=True,
        daily_seasonality=False,
        interval_width=0.85,  # 85% confidence interval
    )
    model.fit(daily)

    # Predict future
    future = model.make_future_dataframe(periods=periods)
    forecast = model.predict(future)

    # Split into historical (actual) and future (predicted) parts
    historical = daily.copy()
    historical_dates = set(historical["ds"].dt.strftime("%Y-%m-%d"))

    result_historical = [
        {"date": row["ds"].strftime("%Y-%m-%d"), "actual": round(row["y"], 2)}
        for _, row in historical.iterrows()
    ]

    result_forecast = [
        {
            "date": row["ds"].strftime("%Y-%m-%d"),
            "predicted": round(row["yhat"], 2),
            "lower_bound": round(row["yhat_lower"], 2),
            "upper_bound": round(row["yhat_upper"], 2),
        }
        for _, row in forecast.iterrows()
        if row["ds"].strftime("%Y-%m-%d") not in historical_dates
    ]

    return {
        "historical": result_historical,
        "forecast": result_forecast,
        "periods_forecasted": periods,
    }