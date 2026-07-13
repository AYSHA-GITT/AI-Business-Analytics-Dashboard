import pandas as pd


def _find_col(column_info, keywords):
    for col in column_info:
        if any(k in col.lower() for k in keywords):
            return col
    return None


def generate_mode_insights(mode: str, df: pd.DataFrame, column_info: dict) -> dict:
    if mode == "marketing":
        return _marketing_insights(df, column_info)
    elif mode == "inventory":
        return _inventory_insights(df, column_info)
    elif mode == "personal_finance":
        return _personal_finance_insights(df, column_info)
    else:
        return {"mode": "sales", "insights": []}


def _marketing_insights(df, column_info):
    spend_col = _find_col(column_info, ["spend", "cost", "budget"])
    conversion_col = _find_col(column_info, ["conversion", "purchase"])
    click_col = _find_col(column_info, ["click"])
    revenue_col = _find_col(column_info, ["revenue", "sales_amount"])

    insights = []

    if spend_col and revenue_col:
        total_spend = df[spend_col].sum()
        total_revenue = df[revenue_col].sum()
        if total_spend > 0:
            roi = (total_revenue - total_spend) / total_spend * 100
            insights.append({
                "label": "Return on Investment (ROI)",
                "value": f"{roi:.1f}%",
                "detail": f"₹{total_revenue:,.0f} revenue from ₹{total_spend:,.0f} spend",
            })

    if spend_col and conversion_col:
        total_spend = df[spend_col].sum()
        total_conversions = df[conversion_col].sum()
        if total_conversions > 0:
            cpa = total_spend / total_conversions
            insights.append({
                "label": "Cost per Conversion",
                "value": f"₹{cpa:,.2f}",
                "detail": f"{int(total_conversions)} total conversions",
            })

    if click_col and conversion_col:
        total_clicks = df[click_col].sum()
        total_conversions = df[conversion_col].sum()
        if total_clicks > 0:
            conv_rate = total_conversions / total_clicks * 100
            insights.append({
                "label": "Conversion Rate",
                "value": f"{conv_rate:.2f}%",
                "detail": f"{int(total_conversions)} conversions from {int(total_clicks)} clicks",
            })

    if not insights:
        insights.append({
            "label": "Marketing columns not detected",
            "value": "—",
            "detail": "Upload data with spend, clicks, or conversion columns to see ROI insights.",
        })

    return {"mode": "marketing", "insights": insights}


def _inventory_insights(df, column_info):
    stock_col = _find_col(column_info, ["stock", "inventory", "qty"])
    sold_col = _find_col(column_info, ["units_sold", "sold", "quantity_sold"])
    product_col = _find_col(column_info, ["product", "item", "sku"])

    insights = []
    alerts = []

    if stock_col and sold_col and product_col:
        grouped = df.groupby(product_col).agg(
            avg_daily_sold=(sold_col, "mean"),
            current_stock=(stock_col, "last"),
        ).reset_index()

        grouped["days_until_stockout"] = grouped.apply(
            lambda row: (row["current_stock"] / row["avg_daily_sold"]) if row["avg_daily_sold"] > 0 else None,
            axis=1,
        )

        risky = grouped[grouped["days_until_stockout"] < 14].sort_values("days_until_stockout")

        for _, row in risky.iterrows():
            days_left = round(row["days_until_stockout"], 1) if row["days_until_stockout"] is not None else None
            alerts.append({
                "product": row[product_col],
                "days_left": days_left,
                "message": f"'{row[product_col]}' will run out in approximately {days_left} days at current sales pace.",
            })

        insights.append({
            "label": "Products at Stockout Risk",
            "value": str(len(risky)),
            "detail": "Products likely to run out within 14 days",
        })
    else:
        insights.append({
            "label": "Inventory columns not detected",
            "value": "—",
            "detail": "Upload data with stock/quantity columns to see reorder alerts.",
        })

    return {"mode": "inventory", "insights": insights, "stockout_alerts": alerts}


def _personal_finance_insights(df, column_info):
    amount_col = _find_col(column_info, ["amount", "revenue", "expense", "spending", "price"])
    category_col = _find_col(column_info, ["category", "product", "merchant", "type"])

    insights = []

    if amount_col:
        total_spent = df[amount_col].sum()
        avg_transaction = df[amount_col].mean()
        insights.append({
            "label": "Total Spending",
            "value": f"₹{total_spent:,.0f}",
            "detail": f"Across {len(df)} transactions",
        })
        insights.append({
            "label": "Average Transaction",
            "value": f"₹{avg_transaction:,.0f}",
            "detail": None,
        })

    if amount_col and category_col:
        by_category = df.groupby(category_col)[amount_col].sum()
        top_category = by_category.idxmax()
        top_amount = by_category.max()
        insights.append({
            "label": "Top Spending Category",
            "value": str(top_category),
            "detail": f"₹{top_amount:,.0f} spent",
        })

    if not insights:
        insights.append({
            "label": "Finance columns not detected",
            "value": "—",
            "detail": "Upload data with amount/category columns to see spending insights.",
        })

    return {"mode": "personal_finance", "insights": insights}