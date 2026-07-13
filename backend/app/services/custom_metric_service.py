import pandas as pd
import re

ALLOWED_OPERATORS = set("+-*/(). ")


def calculate_custom_metric(df: pd.DataFrame, formula: str, numeric_columns: list) -> dict:
    """
    Evaluate a simple formula like 'revenue / units_sold' or 'spend + tax'
    using only the totals of numeric columns. Safe by design: no eval() on
    raw user text, only a restricted expression built from known column totals.
    """
    # Validate: formula must only reference known numeric columns + basic math symbols
    working_formula = formula
    totals = {}

    for col in numeric_columns:
        total = df[col].sum()
        totals[col] = total

    # Replace column names with their totals, longest names first to avoid partial matches
    sorted_cols = sorted(numeric_columns, key=len, reverse=True)
    safe_expr = formula
    for col in sorted_cols:
        pattern = r'\b' + re.escape(col) + r'\b'
        safe_expr = re.sub(pattern, str(totals[col]), safe_expr)

    # After substitution, only digits, operators, decimal points, and spaces should remain
    remaining_chars = set(safe_expr) - set("0123456789.+-*/() eE")
    if remaining_chars:
        return {
            "error": f"Formula contains unrecognized terms: {', '.join(remaining_chars)}. "
                     f"Use only column names ({', '.join(numeric_columns)}) and + - * / ( )"
        }

    try:
        # Safe because safe_expr has been reduced to pure numbers and math operators only
        result = eval(safe_expr, {"__builtins__": {}}, {})
    except ZeroDivisionError:
        return {"error": "Formula results in division by zero."}
    except Exception as e:
        return {"error": f"Could not evaluate formula: {str(e)}"}

    return {
        "formula": formula,
        "result": round(result, 2) if isinstance(result, (int, float)) else result,
        "column_totals_used": {col: round(totals[col], 2) for col in numeric_columns if col in formula},
    }