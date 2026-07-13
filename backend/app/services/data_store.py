import pandas as pd

# Simple in-memory storage for the currently uploaded dataset
# (Fine for a single-user demo project; a real production app would use a database or session-based cache)
_current_data = {"df": None, "filename": None}


def store_dataframe(df: pd.DataFrame, filename: str):
    _current_data["df"] = df
    _current_data["filename"] = filename


def get_dataframe():
    return _current_data["df"], _current_data["filename"]