import pandas as pd
import numpy as np


def check_data_quality(df: pd.DataFrame, column_info: dict) -> dict:
    issues = []
    total_rows = len(df)

    for col, info in column_info.items():
        missing_count = info["missing_count"]
        missing_pct = round((missing_count / total_rows) * 100, 1) if total_rows > 0 else 0

        if missing_count > 0:
            severity = "high" if missing_pct > 10 else ("medium" if missing_pct > 2 else "low")
            issues.append({
                "type": "missing_values",
                "column": col,
                "severity": severity,
                "message": f"Column '{col}' has {missing_count} missing values ({missing_pct}% of rows).",
            })

        # Check for outliers in numeric columns using IQR method
        if info["detected_type"] == "number":
            series = df[col].dropna()
            if len(series) > 0:
                q1 = series.quantile(0.25)
                q3 = series.quantile(0.75)
                iqr = q3 - q1
                lower_fence = q1 - 1.5 * iqr
                upper_fence = q3 + 1.5 * iqr
                outlier_count = ((series < lower_fence) | (series > upper_fence)).sum()
                if outlier_count > 0:
                    outlier_pct = round((outlier_count / len(series)) * 100, 1)
                    issues.append({
                        "type": "outliers",
                        "column": col,
                        "severity": "medium" if outlier_pct > 5 else "low",
                        "message": f"Column '{col}' has {outlier_count} potential outlier values ({outlier_pct}% of rows).",
                    })

    # Check for duplicate rows
    duplicate_count = df.duplicated().sum()
    if duplicate_count > 0:
        issues.append({
            "type": "duplicates",
            "column": None,
            "severity": "medium" if duplicate_count > total_rows * 0.05 else "low",
            "message": f"Found {duplicate_count} fully duplicate rows in the dataset.",
        })

    # Overall quality score (simple heuristic: 100 minus penalty per issue, weighted by severity)
    severity_penalty = {"high": 15, "medium": 7, "low": 3}
    total_penalty = sum(severity_penalty.get(issue["severity"], 0) for issue in issues)
    quality_score = max(0, 100 - total_penalty)

    return {
        "quality_score": quality_score,
        "total_issues": len(issues),
        "issues": issues,
    }