import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest


def detect_anomalies(df: pd.DataFrame, date_col: str, value_col: str, category_cols: list) -> list:
    # Aggregate by date first (total revenue per day)
    daily = df.groupby(date_col)[value_col].sum().reset_index()
    daily.columns = ["date", "value"]
    daily["date"] = pd.to_datetime(daily["date"])
    daily = daily.sort_values("date").reset_index(drop=True)

    if len(daily) < 10:
        return []

    # Isolation Forest expects a 2D array of features
    X = daily[["value"]].values

    model = IsolationForest(contamination=0.03, random_state=42)  # expect ~3% of days to be anomalies
    daily["anomaly_flag"] = model.fit_predict(X)  # -1 means anomaly, 1 means normal

    # Calculate how far each value is from the average, to describe severity
    mean_val = daily["value"].mean()
    std_val = daily["value"].std()

    anomalies = daily[daily["anomaly_flag"] == -1].copy()
    anomalies["deviation"] = ((anomalies["value"] - mean_val) / std_val).round(2)
    anomalies["direction"] = anomalies["value"].apply(lambda v: "spike" if v > mean_val else "drop")

    results = []
    for _, row in anomalies.iterrows():
        anomaly_date_str = row["date"].strftime("%Y-%m-%d")

        explanation = _explain_anomaly(df, date_col, value_col, category_cols, anomaly_date_str, row["direction"])

        results.append({
            "date": anomaly_date_str,
            "value": round(row["value"], 2),
            "average": round(mean_val, 2),
            "direction": row["direction"],
            "deviation_std": row["deviation"],
            "explanation": explanation,
        })

    results.sort(key=lambda x: x["date"])
    return results


def _explain_anomaly(df, date_col, value_col, category_cols, anomaly_date_str, direction) -> str:
    """Find which category (product/region) contributed most to this anomaly."""
    day_data = df[df[date_col].astype(str) == anomaly_date_str]

    if day_data.empty or not category_cols:
        return f"Unusual {direction} in {value_col} detected on this day, but no category breakdown available."

    # Use the first category column (e.g., 'product') to find the top contributor
    cat_col = category_cols[0]
    breakdown = day_data.groupby(cat_col)[value_col].sum().sort_values(ascending=False)

    if breakdown.empty:
        return f"Unusual {direction} in {value_col} detected on this day."

    top_category = breakdown.index[0]
    top_value = breakdown.iloc[0]
    total = breakdown.sum()
    contribution_pct = round((top_value / total) * 100, 1) if total > 0 else 0

    return (
        f"This {direction} appears mainly driven by '{top_category}', "
        f"which contributed {contribution_pct}% of that day's total {value_col}."
    )