import pandas as pd


def compare_datasets(df_a: pd.DataFrame, df_b: pd.DataFrame, label_a: str, label_b: str,
                       number_col: str, category_col: str = None) -> dict:
    total_a = df_a[number_col].sum()
    total_b = df_b[number_col].sum()

    change_pct = ((total_b - total_a) / total_a * 100) if total_a != 0 else None

    result = {
        "label_a": label_a,
        "label_b": label_b,
        "total_a": round(total_a, 2),
        "total_b": round(total_b, 2),
        "change_pct": round(change_pct, 2) if change_pct is not None else None,
        "avg_a": round(df_a[number_col].mean(), 2),
        "avg_b": round(df_b[number_col].mean(), 2),
        "rows_a": len(df_a),
        "rows_b": len(df_b),
    }

    if category_col and category_col in df_a.columns and category_col in df_b.columns:
        grouped_a = df_a.groupby(category_col)[number_col].sum()
        grouped_b = df_b.groupby(category_col)[number_col].sum()

        all_categories = set(grouped_a.index) | set(grouped_b.index)
        breakdown = []
        for cat in all_categories:
            val_a = round(float(grouped_a.get(cat, 0)), 2)
            val_b = round(float(grouped_b.get(cat, 0)), 2)
            diff = round(val_b - val_a, 2)
            breakdown.append({"category": cat, "value_a": val_a, "value_b": val_b, "difference": diff})

        breakdown.sort(key=lambda x: abs(x["difference"]), reverse=True)
        result["category_breakdown"] = breakdown

    return result