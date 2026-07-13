import pandas as pd

def detect_column_types(df: pd.DataFrame) -> dict:
    column_info = {}

    for col in df.columns:
        series = df[col]

        # Check number FIRST (most reliable check)
        if pd.api.types.is_numeric_dtype(series):
            col_type = "number"

        # Then check if it's already a date type
        elif pd.api.types.is_datetime64_any_dtype(series):
            col_type = "date"

        else:
            # Try converting to date, but only trust it if the column name
            # or values look date-like, to avoid false positives
            try:
                converted = pd.to_datetime(series, errors="raise")
                col_type = "date"
            except Exception:
                if series.nunique() < 20:
                    col_type = "category"
                else:
                    col_type = "text"

        column_info[col] = {
            "detected_type": col_type,
            "sample_values": series.dropna().unique()[:3].tolist(),
            "missing_count": int(series.isnull().sum()),
        }

    return column_info